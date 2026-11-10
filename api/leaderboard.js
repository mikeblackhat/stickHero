export default async function handler(req, res) {
    // CORS headers
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
    );

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    const token = process.env.GH_TOKEN;
    const gistId = process.env.GIST_ID;

    if (!token || !gistId) {
        return res.status(500).json({ error: "Missing GH_TOKEN or GIST_ID in server environment" });
    }

    const gistUrl = `https://api.github.com/gists/${gistId}`;

    async function fetchGistContent() {
        const response = await fetch(gistUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "stickHero-Leaderboard"
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch gist: ${response.status}`);
        }
        const data = await response.json();
        const file = data.files && data.files["leaderboard.json"];
        if (!file || !file.content) {
            return [];
        }
        try {
            return JSON.parse(file.content);
        } catch {
            return [];
        }
    }

    if (req.method === "GET") {
        try {
            const list = await fetchGistContent();
            res.setHeader("Cache-Control", "s-maxage=2, stale-while-revalidate=5");
            return res.status(200).json(list);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    if (req.method === "POST") {
        try {
            let body = req.body;
            if (typeof body === "string") {
                try {
                    body = JSON.parse(body);
                } catch {
                    body = {};
                }
            }

            const name = (body.name || "JUGADOR").toString().trim().toUpperCase().slice(0, 10);
            const score = parseInt(body.score, 10) || 0;
            const time = (body.time || "--:--").toString().slice(0, 10);
            const date = new Date().toLocaleDateString(undefined, { month: "numeric", day: "numeric" });

            const currentList = await fetchGistContent();
            currentList.push({ name, score, time, date });

            // Sort descending by score, secondary by time
            currentList.sort((a, b) => b.score - a.score);

            // Keep top 20
            const updatedList = currentList.slice(0, 20);

            // Update Gist
            const updateResponse = await fetch(gistUrl, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/vnd.github.v3+json",
                    "Content-Type": "application/json",
                    "User-Agent": "stickHero-Leaderboard"
                },
                body: JSON.stringify({
                    files: {
                        "leaderboard.json": {
                            content: JSON.stringify(updatedList, null, 2)
                        }
                    }
                })
            });

            if (!updateResponse.ok) {
                throw new Error(`Failed to update gist: ${updateResponse.status}`);
            }

            return res.status(200).json(updatedList);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}

