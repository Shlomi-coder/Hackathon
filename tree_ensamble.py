import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# # Ensure these are the correct columns in your DataFrame
# expected_columns = [
#     "num_of_comments", "option_to_comment", "video_length", "likes",
#     "dislikes", "likes_dislikes_ratio", "channel_age",
#     "num_of_videos_in_channel", "avg_views_per_video",
#     "upload_frequency", "is_real"
# ]

# # Make sure your DataFrame has the expected structure
# assert all(col in df.columns for col in expected_columns), "Missing required columns"

def feature_preprocessing(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series]:
    # Separate features and label
    X = df.drop(columns=["is_real"])
    y = df["is_real"]
    return X, y


def test_train_split(X: pd.DataFrame, y: pd.Series) -> tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    # Train/test split
    random_state = 42
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=random_state)
    return X_train, X_test, y_train, y_test


def train_model(X_train: pd.DataFrame, y_train: pd.Series) -> xgb.XGBClassifier:
    # Initialize and train XGBoost classifier
    model = xgb.XGBClassifier(
        objective='binary:logistic',
        eval_metric='logloss',
        use_label_encoder=False,
        random_state=random_state
    )
    model.fit(X_train, y_train)
    return model


def predict_probabilities(model: xgb.XGBClassifier, X_test: pd.DataFrame) -> list[tuple[float, float]]:
    # Predict probabilities
    proba = model.predict_proba(X_test)

    # Output probabilities
    for i, (prob_fake, prob_real) in enumerate(proba):
        print(f"Video {i+1}: Probability Real = {prob_real:.2f}, Probability Fake = {prob_fake:.2f}")
    return proba


def evaluate_model(model: xgb.XGBClassifier, X_test: pd.DataFrame, y_test: pd.Series) -> None:
    y_pred = model.predict(X_test)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["Fake", "Real"]))


    def run_modeling(df: pd.DataFrame) -> None:
    X, y = feature_preprocessing(df)
    X_train, X_test, y_train, y_test = test_train_split(X, y)
    model = train_model(X_train, y_train)
    predict_probabilities(model, X_test)
    evaluate_model(model, X_test, y_test)


# if __name__ == "__main__":
#     run_modeling(json_to_pd.json_to_pd("data/train_data.json"))
#     exit(0)
