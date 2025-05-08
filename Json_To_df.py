import json
import time
import pandas as pd
from secrets import YOUTUBE_API_KEY
import execjs

def load_js_file():
    # Load the JavaScript file
    with open('youtubeApi.js', 'r') as file:
        js_code = file.read()
    # Create a JavaScript context
    ctx = execjs.compile(js_code)
    return ctx


def load_df(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    ctx = load_js_file()
    fill_df_features_using_youtube_api_request(df, ctx)
    return df

def fill_df_features_using_youtube_api_request(df: pd.DataFrame, ctx: execjs.Context) -> pd.DataFrame:
    """
    Fill DataFrame features using YouTube API metadata.
    
    Args:
        df (pd.DataFrame): Input DataFrame containing YouTube URLs
        
    Returns:
        pd.DataFrame: DataFrame with added YouTube metadata features
    """
    
    # Process each row
    for index, row in df.iterrows():
            # Extract video ID from URL
            video_id = ctx.call('extractVideoId', row['url'])
            if not video_id:
                continue
                
            # Fetch video metadata using YouTube API
            metadata = ctx.call('fetchVideoMetadata', video_id, YOUTUBE_API_KEY)
            
            # Update DataFrame with metadata
            df.at[index, 'video_url'] = metadata.get('video_url')
            df.at[index, 'option_to_comment'] = metadata.get('option_to_comment')
            df.at[index, 'video_length'] = metadata.get('video_length')
            df.at[index, 'likes'] = metadata.get('likes')
            df.at[index, 'views'] = metadata.get('views')
            df.at[index, 'likes_views_ratio'] = metadata.get('likes_views_ratio')
            df.at[index, 'channel_age'] = metadata.get('channel_age')
            df.at[index, 'number_of_videos'] = metadata.get('number_of_videos')
            df.at[index, 'avg_views_per_video'] = metadata.get('avg_views_per_video')
            df.at[index, 'upload_frequency'] = metadata.get('upload_frequency')
    return df


