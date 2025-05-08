import numpy as np

class MLP:
    def __init__(self, input_size, hidden_sizes, output_size, learning_rate=0.01):
        """
        Initialize the Multi-Layer Perceptron.
        
        Args:
            input_size (int): Number of input features
            hidden_sizes (list): List of integers representing the number of neurons in each hidden layer
            output_size (int): Number of output classes
            learning_rate (float): Learning rate for gradient descent
        """
        self.learning_rate = learning_rate
        self.layer_sizes = [input_size] + hidden_sizes + [output_size]
        self.weights = []
        self.biases = []
        
        # Initialize weights and biases for each layer
        for i in range(len(self.layer_sizes) - 1):
            # He initialization for weights
            self.weights.append(np.random.randn(self.layer_sizes[i], self.layer_sizes[i + 1]) * np.sqrt(2.0 / self.layer_sizes[i]))
            self.biases.append(np.zeros((1, self.layer_sizes[i + 1])))
    
    def sigmoid(self, x):
        """Sigmoid activation function"""
        return 1 / (1 + np.exp(-np.clip(x, -500, 500)))
    
    def sigmoid_derivative(self, x):
        """Derivative of sigmoid function"""
        return x * (1 - x)
    
    def forward(self, X):
        """
        Forward pass through the network.
        
        Args:
            X (numpy.ndarray): Input data of shape (n_samples, n_features)
            
        Returns:
            list: List of activations for each layer
        """
        self.activations = [X]
        self.z_values = []
        
        for i in range(len(self.weights)):
            z = np.dot(self.activations[-1], self.weights[i]) + self.biases[i]
            self.z_values.append(z)
            activation = self.sigmoid(z)
            self.activations.append(activation)
        
        return self.activations[-1]
    
    def backward(self, X, y):
        """
        Backward pass to compute gradients and update weights.
        
        Args:
            X (numpy.ndarray): Input data
            y (numpy.ndarray): Target labels
        """
        m = X.shape[0]
        delta = self.activations[-1] - y
        
        for i in range(len(self.weights) - 1, -1, -1):
            # Compute gradients
            dW = np.dot(self.activations[i].T, delta) / m
            db = np.sum(delta, axis=0, keepdims=True) / m
            
            if i > 0:
                delta = np.dot(delta, self.weights[i].T) * self.sigmoid_derivative(self.activations[i])
            
            # Update weights and biases
            self.weights[i] -= self.learning_rate * dW
            self.biases[i] -= self.learning_rate * db
    
    def train(self, X, y, epochs, batch_size=32):
        """
        Train the MLP.
        
        Args:
            X (numpy.ndarray): Input data
            y (numpy.ndarray): Target labels
            epochs (int): Number of training epochs
            batch_size (int): Size of mini-batches
        """
        for epoch in range(epochs):
            # Shuffle the data
            indices = np.random.permutation(len(X))
            X_shuffled = X[indices]
            y_shuffled = y[indices]
            
            # Mini-batch training
            for i in range(0, len(X), batch_size):
                X_batch = X_shuffled[i:i + batch_size]
                y_batch = y_shuffled[i:i + batch_size]
                
                # Forward and backward pass
                self.forward(X_batch)
                self.backward(X_batch, y_batch)
            
            # Print progress
            if (epoch + 1) % 10 == 0:
                predictions = self.forward(X)
                loss = np.mean(np.square(predictions - y))
                print(f"Epoch {epoch + 1}/{epochs}, Loss: {loss:.4f}")
    
    def predict(self, X):
        """
        Make predictions for new data.
        
        Args:
            X (numpy.ndarray): Input data
            
        Returns:
            numpy.ndarray: Predicted probabilities scaled to 0-100
        """
        predictions = self.forward(X)
        return predictions * 100  # Scale to 0-100

def normalize_features(X):
    """
    Normalize input features to appropriate ranges.
    
    Args:
        X (numpy.ndarray): Input features
        
    Returns:
        numpy.ndarray: Normalized features
    """
    # Normalize video_length (assuming max length of 3600 seconds = 1 hour)
    X[:, 1] = X[:, 1] / 3600.0
    
    # Normalize likes (assuming max likes of 1,000,000)
    X[:, 2] = X[:, 2] / 1000000.0
    
    # Normalize dislikes (assuming max dislikes of 100,000)
    X[:, 3] = X[:, 3] / 100000.0
    
    # likes_dislikes_ratio is already between 0-1
    
    # Normalize channel_age (assuming max age of 120 months = 10 years)
    X[:, 6] = X[:, 6] / 120.0
    
    # Normalize num_of_videos (assuming max of 1000 videos)
    X[:, 7] = X[:, 7] / 1000.0
    
    # Normalize avg_views_per_video (assuming max of 1,000,000 views)
    X[:, 8] = X[:, 8] / 1000000.0
    
    # Normalize upload_frequency (assuming max of 10 videos per day)
    X[:, 9] = X[:, 9] / 10.0
    
    return X

# Example usage
if __name__ == "__main__":
    # Generate some example data
    np.random.seed(42)
    n_samples = 1000
    
    # Create example data with the specified features
    X = np.zeros((n_samples, 10))
    X[:, 0] = np.random.randint(0, 2, n_samples)  # option_to_comment (binary)
    X[:, 1] = np.random.uniform(10, 3600, n_samples)  # video_length (seconds)
    X[:, 2] = np.random.randint(0, 1000000, n_samples)  # likes
    X[:, 3] = np.random.randint(0, 100000, n_samples)  # dislikes
    X[:, 4] = np.random.randint(0, 2, n_samples)  # is_shady (binary)
    X[:, 5] = np.random.uniform(0, 1, n_samples)  # likes_dislikes_ratio
    X[:, 6] = np.random.uniform(1, 120, n_samples)  # channel_age (months)
    X[:, 7] = np.random.randint(1, 1000, n_samples)  # num_of_videos
    X[:, 8] = np.random.randint(1000, 1000000, n_samples)  # avg_views_per_video
    X[:, 9] = np.random.uniform(0.1, 10, n_samples)  # upload_frequency
    
    # Normalize the features
    X_normalized = normalize_features(X)
    
    # Set all labels to 33
    y = np.random.uniform(35, 45, (n_samples, 1))
    
    # Create and train the MLP
    mlp = MLP(input_size=10, hidden_sizes=[64, 32], output_size=1)
    mlp.train(X_normalized, y/100, epochs=100, batch_size=32)  # Scale y to 0-1 for training
    
    # Example prediction with same features as training data
    test_X = np.array([[1, 300, 50000, 1000, 0, 0.8, 24, 100, 50000, 2]])  # Example input
    test_X_normalized = normalize_features(test_X)
    prediction = mlp.predict(test_X_normalized)
    print("\nPrediction for test data:")
    print(f"Authenticity score: {prediction[0][0]:.2f}/100")
    print(f"Expected score: 33.00/100")