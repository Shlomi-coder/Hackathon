import json
import time
import pandas as pd

# { 
#  "kind": "youtube#videoListResponse",
#  "etag": "\"UCBpFjp2h75_b92t44sqraUcyu0/sDAlsG9NGKfr6v5AlPZKSEZdtqA\"",
#  "videos": [
#   {
#    "id": "7lCDEYXw3mM",
#    "kind": "youtube#video",
#    "etag": "\"UCBpFjp2h75_b92t44sqraUcyu0/iYynQR8AtacsFUwWmrVaw4Smb_Q\"",
#    "snippet": { 
#     "publishedAt": "2012-06-20T22:45:24.000Z",
#     "channelId": "UC_x5XG1OV2P6uZZ5FSM9Ttw",
#     "title": "Google I/O 101: Q&A On Using Google APIs",
#     "description": "Antonio Fuentes speaks to us and takes questions on working with Google APIs and OAuth 2.0.",
#     "thumbnails": {
#      "default": {
#       "url": "https://i.ytimg.com/vi/7lCDEYXw3mM/default.jpg"
#      },
#      "medium": {
#       "url": "https://i.ytimg.com/vi/7lCDEYXw3mM/mqdefault.jpg"
#      },
#      "high": {
#       "url": "https://i.ytimg.com/vi/7lCDEYXw3mM/hqdefault.jpg"
#      }
#     },
#     "categoryId": "28"
#    },
#    "statistics": {
#     "viewCount": "3057",
#     "likeCount": "25",
#     "dislikeCount": "0",
#     "favoriteCount": "17",
#     "commentCount": "12"
#    }
#   }
#  ]
# }
#     "option_to_comment", "video_length",
#     "num_of_videos_in_channel", "avg_views_per_video",
#     "upload_frequency", "is_real"

def json_to_pd(json_name: str) -> pd.DataFrame:
    with open(json_name, "r") as f:
        data = json.load(f)
        df = pd.DataFrame()
        for video in data["videos"]:
            df['id'] = video['id']
            df['viewCount'] = video['statistics']['viewCount']
            df['likes'] = video['statistics']['likeCount']
            df['dislikes'] = video['statistics']['dislikeCount']
            df['likes_dislikes_ratio'] = df['likes'] / df['dislikes']
            df['channel_age'] = time.time() - video['snippet']['publishedAt']
            df['favorite_count'] = video['statistics']['favoriteCount']
            df['num_of_comments'] = video['statistics']['commentCount']
            df.set_index('id', inplace=True)
        return df

