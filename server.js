const express = require("express");
const cors = require("cors");
require("dotenv").config();

const BASE_URL = "https://api.app.reclaim.ai/api";

const app = express();
const port = 8089;

app.use(cors("*"));
app.get("/events", async (req, res) => {
  const start = new Date().toISOString().split("T")[0];
  let end = new Date();
  end.setDate(end.getDate() + 2);
  end = end.toISOString().split("T")[0];

  const query = new URLSearchParams({
    allConnected: "true",
    start,
    end,
  });

  const result = await fetch(`${BASE_URL}/events?${query.toString()}`, {
    method: "GET",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-type": "Application/json",
      Authorization: `Bearer ${process.env.API_KEY}`,
    },
  });

  const data = (await result.json()).filter((event) => {
    if (new Date(event.eventEnd) < new Date()) {
      return false;
    }

    return true;
  });

  return res.json(data);
});

app.listen(port);
