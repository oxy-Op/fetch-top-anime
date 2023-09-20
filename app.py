from time import sleep
from flask import Flask, jsonify, render_template
import requests
from bs4 import BeautifulSoup
from json import load
import os
from flask import Flask
from flask_cors import CORS


app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.template_folder = "templates"
print(app.template_folder)
app.static_folder = "static"
CORS(app)


def config(key):
    c = open(os.path.join(os.getcwd(), "config.json"), "r")
    return load(c)[key]


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/demo")
def demo():
    top_items = {}

    top_items["rankings"] = [
        {
            "image": "https://cdn.myanimelist.net/images/anime/1279/131078l.jpg",
            "name": "Shingeki no Kyojin: The Final Season - Kanketsu-hen",
            "rank": "1",
            "score": "9.03",
        },
        {
            "image": "https://cdn.myanimelist.net/images/anime/1164/138058l.jpg",
            "name": "Bleach: Sennen Kessen-hen - Ketsubetsu-tan",
            "rank": "2",
            "score": "8.97",
        },
        {
            "image": "https://cdn.myanimelist.net/images/anime/1792/138022l.jpg",
            "name": "Jujutsu Kaisen 2nd Season",
            "rank": "3",
            "score": "8.82",
        },
        {
            "image": "https://cdn.myanimelist.net/images/anime/1161/136691l.jpg",
            "name": "Bungou Stray Dogs 5th Season",
            "rank": "4",
            "score": "8.72",
        },
        {
            "image": "https://cdn.myanimelist.net/images/anime/1770/97704l.jpg",
            "name": "One Piece",
            "rank": "5",
            "score": "8.70",
        },
        {
            "image": "https://cdn.myanimelist.net/images/anime/1898/138005l.jpg",
            "name": "Mushoku Tensei II: Isekai Ittara Honki Dasu",
            "rank": "6",
            "score": "8.51",
        },
        {
            "image": "https://cdn.myanimelist.net/images/anime/1897/137108l.jpg",
            "name": "Shiguang Dailiren II",
            "rank": "7",
            "score": "8.33",
        },
        {
            "image": "https://cdn.myanimelist.net/images/anime/1147/122444l.jpg",
            "name": "Watashi no Shiawase na Kekkon",
            "rank": "8",
            "score": "8.24",
        },
        {
            "image": "https://cdn.myanimelist.net/images/anime/1259/110227l.jpg",
            "name": "Holo no Graffiti",
            "rank": "9",
            "score": "8.22",
        },
        {
            "image": "https://cdn.myanimelist.net/images/anime/1007/136277l.jpg",
            "name": "Horimiya: Piece",
            "rank": "10",
            "score": "8.19",
        },
    ]
    top_items["status"] = "success"
    sleep(4)
    return jsonify(top_items)


def fetch_anime_image(anime_name, trailer=False):
    base_url = config("jikanmoe")
    url = f"{base_url}/anime?q={anime_name}&limit=1"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()["data"]
            if data:
                trailer_image_url = data[0]["trailer"]["images"]["maximum_image_url"]
                image_url = data[0]["images"]["jpg"]["large_image_url"]
                if trailer:
                    return trailer_image_url
                elif trailer == False:
                    return image_url
                else:
                    print("could not find image")
            else:
                print(f"No results found for '{anime_name}'")
        else:
            print(f"Failed to retrieve data for '{anime_name}'")
    except Exception as e:
        print("An error occurred:", str(e))


@app.route("/fetch/<int:t>/<int:n>", methods=["GET"])
def fetch(t: int, n: int):
    if not n:
        return jsonify({"status": "failed"})

    response = requests.get(config("airing_url"))

    if response.status_code == 200:
        try:
            html = response.text
            soup = BeautifulSoup(html, "html.parser")

            # Find the <div> with class "pb12"
            pb12_div = soup.find("div", class_="pb12")

            # Find the <table> with class "top-ranking-table"
            top_ranking_table = pb12_div.find("table", class_="top-ranking-table")

            # Find all <tr> elements with class "ranking-list"
            ranking_list_rows = top_ranking_table.find_all("tr", class_="ranking-list")

            # Initialize a list to store the data for the top items
            top_items = {"rankings": []}

            # Loop through the top items and extract data
            for row in ranking_list_rows[:n]:
                item_data = {}

                # Extract rank from <td> with class "rank"
                rank_td = row.find("td", class_="rank")
                rank_span = rank_td.find("span")
                item_data["rank"] = rank_span.text.strip()

                # Extract name from <td> with class "title"
                title_td = row.find("td", class_="title")
                detail_div = title_td.find("div", class_="detail")
                h3 = detail_div.find("h3")
                item_data["name"] = h3.text.strip()

                # Extract score from <td> with class "score"
                score_td = row.find("td", class_="score")
                score_div = score_td.find("div", class_="js-top-ranking-score-col")
                score_span = score_div.find("span")
                item_data["score"] = score_span.text.strip()

                anime_name = h3.text.strip()
                if t == 0:
                    item_data["image"] = fetch_anime_image(anime_name)
                elif t == 1:
                    item_data["image"] = fetch_anime_image(anime_name, True)

                # Append the item data to the list
                top_items["rankings"].append(item_data)
            # Print the JSON object
            top_items["status"] = "success"
            return jsonify(top_items)
        except:
            return jsonify({"status": "failed"})
    else:
        print("Failed to fetch the page. Status code:", response.status_code)
        return jsonify({"status": "failed"})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)
