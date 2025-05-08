import json
import time
import pandas as pd

#     "option_to_comment", "video_length",
#     "num_of_videos_in_channel", "avg_views_per_video",
#     "upload_frequency", "is_real"

# def json_to_pd(json_name: str) -> pd.DataFrame:
#     with open(json_name, "r") as f:
#         data = json.load(f)
        
#         # Pre-allocate lists to store data
#         ids = []
#         views = []
#         likes = []
#         comment_counts = []
#         vid_length = []
        
#         # Collect data in lists
#         for video in data["items"]:
#             ids.append(video['id'])
#             views.append(video['statistics']['viewCount'])
#             likes.append(video['statistics']['likeCount'])
#             comment_counts.append(video['statistics']['commentCount'])
#             vid_length.append(video['contentDetails']['duration'])

        
#         # Create DataFrame once with all data
#         df = pd.DataFrame({
#             'id': ids,
#             'views': views,
#             'likes': likes,
#             'num_of_comments': comment_counts,
#             'video_length': vid_length,
#         })
        
#         # Calculate derived columns once
#         df['likes_views_ratio'] = df['likes'].astype(float) / df['views'].astype(float)
#         df['channel_age'] = time.time() - pd.to_datetime(df['published_at']).astype(int) // 10**9
#         df['is_real'] = 1
#         df['option_to_comment'] = (df['num_of_comments'] > 0).astype(int)
        
#         # Set index once at the end
#         df.set_index('id', inplace=True)
#         return df

def json_to_df(json_name: str) -> pd.DataFrame:
    with open(json_name, "r") as f:
        data = json.load(f)
    return pd.DataFrame(data)


