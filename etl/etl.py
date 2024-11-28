import mysql.connector
import pandas as pd 
from unidecode import unidecode

JSON_PATH = "data/games.json"

# Import JSON file

jdf = pd.read_json(JSON_PATH, orient='index', encoding='utf8')
jdf.reset_index(inplace=True)

# Drop excluded/useless columns

COLS_TO_DROP = [
  "required_age",
  "dlc_count",
  "detailed_description",
  "about_the_game",
  "short_description",
  "reviews",
  "header_image",
  "support_url",
  "support_email",
  "metacritic_score",
  "metacritic_url",
  "achievements",
  "notes",
  "full_audio_languages",
  "packages",
  "categories",
  "screenshots",
  "movies",
  "user_score",
  "score_rank",
  "estimated_owners",
  "average_playtime_forever",
  "average_playtime_2weeks",
  "median_playtime_forever",
  "median_playtime_2weeks",
  "peak_ccu"
]

jdf.drop(labels=COLS_TO_DROP, axis=1, inplace=True)

# Fix data types

jdf["release_date"] = pd.to_datetime(jdf["release_date"], errors='coerce')
jdf['tags'] = jdf['tags'].apply(lambda x: list(x) if isinstance(x, dict) else x)

na_release_date_rows = jdf[jdf['release_date'].isna()]
original_na_release_date_rows = jdf[jdf['index'].isin(na_release_date_rows['index'])]

for index, row in original_na_release_date_rows.iterrows():
  year_month = row['release_date']

  if pd.notna(year_month):
    new_date = pd.to_datetime(f"{year_month}-01")
    jdf.loc[jdf['index'] == row['index'], 'release_date'] = new_date

# Fixing empty values

jdf['developers'] = jdf.apply(lambda row: row['publishers'] if len(row['developers']) == 0 else row['developers'], axis=1)

all_genres = set(genre for sublist in jdf['genres'] for genre in sublist)

def filter_tags(row):
  if len(row['genres']) == 0:
    row['genres'] = [tag for tag in row['tags'] if tag in all_genres]
  return row

jdf = jdf.apply(filter_tags, axis=1)
jdf = jdf.replace("", None)

# Fixing badly formatted languages

def matcher(y):
  match y:
    case "English,German,Spanish - Spain,#lang_français":
      return ["English", "German", "Spanish", "French"]
    
    case "Russian\r\nEnglish\r\nSpanish - Spain\r\nFrench\r\nJapanese\r\nCzech":
      return ["Russian", "English", "Spanish", "French", "Japanese", "Czech"]
    
    case "English&amp;lt;strong&amp;gt;&amp;lt;/strong&amp;gt;":
      return ["English"]
    
    case "French&amp;lt;strong&amp;gt;&amp;lt;/strong&amp;gt;":
      return ["French"]
    
    case "Italian&amp;lt;strong&amp;gt;&amp;lt;/strong&amp;gt;":
      return ["Italian"]
    
    case "German&amp;lt;strong&amp;gt;&amp;lt;/strong&amp;gt;":
      return ["German"]
    
    case "Spanish - Spain&amp;lt;strong&amp;gt;&amp;lt;/strong&amp;gt;":
      return ["Spanish - Spain"]
    
    case "Korean&amp;lt;strong&amp;gt;&amp;lt;/strong&amp;gt;":
      return ["Korean"]
    
    case "Japanese &amp;lt;br /&amp;gt;&amp;lt;br /&amp;gt;&amp;lt;strong&amp;gt;&amp;lt;/strong&amp;gt; ":
      return ["Japanese"]

    case 'Spanish - Spain[b][/b]':
      return ['Spanish - Spain']

    case 'Japanese \r\n\r\n[b][/b] ':
      return ['Japanese']

    case 'Italian \r\n\r\n[b][/b] ':
      return ['Italian']

    case 'English (full audio)':
      return ['English']

    case 'Russian\r\n[b][/b]':
      return ['Russian']

    case 'Spanish - Spain\r\n[b][/b]':
      return ['Spanish - Spain']

    case 'Hungarian,Polish':
      return ['Hungarian', 'Polish']

    case 'English\r\nRussian\r\nSpanish - Spain\r\nJapanese\r\nCzech':
      return ['English', 'Russian', 'Spanish - Spain', 'Japanese', 'Czech']

    case 'Japanese (all with full audio support)':
      return ['Japanese']

    case 'English Dutch  English':
      return ['English', 'Dutch'] 
    
    case 'Traditional Chinese (text only)':
      return ['Traditional Chinese']
  
    case 'English[b][/b]':
      return ['English']

    case 'Korean[b][/b]':
      return ['Korean']

    case '\r\nGerman':
      return ['German']

    case 'German[b][/b]':
      return ['German']

    case '\r\nFrench':
      return ['French']

    case 'French[b][/b]':
      return ['French']

    case 'Italian[b][/b]':
      return ['Italian']

    case _:
      return [y]
    
def replacer(x):
  res = []

  for y in x:
    res.extend(matcher(y))

  return res

jdf["supported_languages"] = jdf["supported_languages"].apply(replacer)

# Fixing duplicate values

jdf['genres'] = jdf['genres'].apply(lambda pubs: [unidecode(pub.title()) for pub in pubs])
jdf['developers'] = jdf['developers'].apply(lambda devs: [unidecode(dev.lower()) for dev in devs])

def has_duplicates(lst):
  return len(lst) != len(set(lst))

jdf['developers'] = jdf['developers'].apply(lambda x: list(set(x)) if has_duplicates(x) else x)
jdf['genres'] = jdf['genres'].apply(lambda x: list(set(x)) if has_duplicates(x) else x)
jdf['supported_languages'] = jdf['supported_languages'].apply(lambda x: list(set(x)) if has_duplicates(x) else x)

# Consolidating columns

os_columns = ['windows', 'mac', 'linux']
jdf['platform'] = jdf[os_columns].apply(lambda row: list(set(os for os, val in zip(os_columns, row) if val == 1)), axis=1)

jdf = jdf.drop(columns=os_columns)

# Loading data to DB

mydb = mysql.connector.connect(
  host="localhost",
  port=3301,
  user="root",
  password="12345678",
  database="gamesdb"
)

mycursor = mydb.cursor()

# Insert data into the games table
games_data = [
  (row['index'], row['name'], row['release_date'], row['price'], row['positive'], row['negative'])
  for index, row in jdf.iterrows()
]

sql = "INSERT INTO games (id, name, release_date, price, positive_reviews, negative_reviews) VALUES (%s, %s, %s, %s, %s, %s)"
mycursor.executemany(sql, games_data)

mydb.commit()

mycursor.close()
mydb.close()

print("ETL done.")