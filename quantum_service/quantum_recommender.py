import numpy as np
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister, execute, Aer
from qiskit.algorithms.optimizers import COBYLA
from qiskit.circuit import Parameter
from qiskit_machine_learning.neural_networks import CircuitQNN
from qiskit_machine_learning.algorithms.classifiers import NeuralNetworkClassifier
from sklearn.preprocessing import MinMaxScaler
import pandas as pd
from typing import List, Dict, Any
import json

class QuantumRecommender:
    def __init__(self, n_qubits: int = 4):
        self.n_qubits = n_qubits
        self.scaler = MinMaxScaler()
        self.model = None
        self.feature_names = None
        
    def _create_quantum_circuit(self, n_inputs: int) -> QuantumCircuit:
        """Create a parameterized quantum circuit for recommendations."""
        qr = QuantumRegister(self.n_qubits, 'q')
        cr = ClassicalRegister(self.n_qubits, 'c')
        circuit = QuantumCircuit(qr, cr)
        
        # Create parameterized rotation gates
        params = [Parameter(f'θ{i}') for i in range(n_inputs)]
        
        # Apply parameterized rotations
        for i in range(self.n_qubits):
            for j, param in enumerate(params):
                circuit.ry(param, i)
                circuit.rz(param, i)
        
        # Add entangling layers
        for i in range(self.n_qubits - 1):
            circuit.cx(i, i + 1)
        circuit.cx(self.n_qubits - 1, 0)
        
        # Measure all qubits
        circuit.measure(qr, cr)
        
        return circuit
    
    def _prepare_features(self, user_data: Dict[str, Any], product_data: List[Dict[str, Any]]) -> np.ndarray:
        """Prepare features for the quantum circuit."""
        features = []
        
        # Extract user preferences and product features
        for product in product_data:
            feature_vector = [
                float(user_data.get('price_sensitivity', 0.5)),
                float(product.get('price', 0)) / 1000,  # Normalize price
                float(product.get('rating', 0)) / 5,    # Normalize rating
                float(product.get('popularity', 0)) / 100  # Normalize popularity
            ]
            features.append(feature_vector)
            
        return np.array(features)
    
    def train(self, user_data: Dict[str, Any], product_data: List[Dict[str, Any]], 
             user_interactions: List[Dict[str, Any]]):
        """Train the quantum recommendation model."""
        # Prepare training data
        X = self._prepare_features(user_data, product_data)
        self.feature_names = ['price_sensitivity', 'price', 'rating', 'popularity']
        
        # Create labels from user interactions
        y = np.array([1 if interaction.get('liked', False) else 0 
                     for interaction in user_interactions])
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Create and train quantum circuit
        circuit = self._create_quantum_circuit(X.shape[1])
        
        # Create QNN
        qnn = CircuitQNN(
            circuit=circuit,
            input_params=circuit.parameters[:X.shape[1]],
            output_params=circuit.parameters[X.shape[1]:],
            input_gradients=True
        )
        
        # Create classifier
        self.model = NeuralNetworkClassifier(
            neural_network=qnn,
            optimizer=COBYLA(maxiter=100)
        )
        
        # Train the model
        self.model.fit(X_scaled, y)
    
    def recommend(self, user_data: Dict[str, Any], product_data: List[Dict[str, Any]], 
                 n_recommendations: int = 5) -> List[Dict[str, Any]]:
        """Generate product recommendations using the quantum model."""
        if self.model is None:
            raise ValueError("Model not trained. Please train the model first.")
            
        # Prepare features
        X = self._prepare_features(user_data, product_data)
        X_scaled = self.scaler.transform(X)
        
        # Get predictions
        predictions = self.model.predict_proba(X_scaled)
        
        # Sort products by prediction probability
        product_scores = [(product, score[1]) for product, score in zip(product_data, predictions)]
        product_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Return top N recommendations
        recommendations = []
        for product, score in product_scores[:n_recommendations]:
            recommendations.append({
                'product_id': product.get('id'),
                'name': product.get('name'),
                'confidence_score': float(score),
                'price': product.get('price'),
                'rating': product.get('rating')
            })
            
        return recommendations

# Example usage
if __name__ == "__main__":
    # Sample data
    user_data = {
        'id': 'user1',
        'price_sensitivity': 0.7,
        'preferred_categories': ['electronics', 'books']
    }
    
    product_data = [
        {'id': 'p1', 'name': 'Product 1', 'price': 100, 'rating': 4.5, 'popularity': 80},
        {'id': 'p2', 'name': 'Product 2', 'price': 200, 'rating': 4.0, 'popularity': 60},
        {'id': 'p3', 'name': 'Product 3', 'price': 150, 'rating': 4.8, 'popularity': 90}
    ]
    
    user_interactions = [
        {'product_id': 'p1', 'liked': True},
        {'product_id': 'p2', 'liked': False},
        {'product_id': 'p3', 'liked': True}
    ]
    
    # Create and train recommender
    recommender = QuantumRecommender(n_qubits=4)
    recommender.train(user_data, product_data, user_interactions)
    
    # Get recommendations
    recommendations = recommender.recommend(user_data, product_data, n_recommendations=2)
    print(json.dumps(recommendations, indent=2)) 