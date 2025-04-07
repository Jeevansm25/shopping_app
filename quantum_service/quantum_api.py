from flask import Flask, request, jsonify
from flask_cors import CORS
from quantum_recommender import QuantumRecommender
import json
import os
from dotenv import load_dotenv
from simple_quantum import generate_random_number, flip_coin

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize the quantum recommender
recommender = QuantumRecommender(n_qubits=4)

@app.route('/quantum/random', methods=['POST'])
def random():
    try:
        data = request.get_json()
        num_bits = data.get('numBits', 8)
        
        # Generate random number using our quantum simulator
        random_number = generate_random_number(num_bits)
        return jsonify({'result': random_number})
    except Exception as e:
        print('Error in random number generation:', str(e))  # Add debug logging
        return jsonify({'error': str(e)}), 500

@app.route('/quantum/flip', methods=['POST'])
def flip():
    try:
        # Flip quantum coin using our simulator
        result = flip_coin()
        return jsonify({'result': result})
    except Exception as e:
        print('Error in coin flip:', str(e))  # Add debug logging
        return jsonify({'error': str(e)}), 500

@app.route('/api/quantum/recommend', methods=['POST'])
def get_recommendations():
    try:
        data = request.json
        user_data = data.get('user_data', {})
        product_data = data.get('product_data', [])
        user_interactions = data.get('user_interactions', [])
        n_recommendations = data.get('n_recommendations', 5)

        # Train the model with the provided data
        recommender.train(user_data, product_data, user_interactions)
        
        # Get recommendations
        recommendations = recommender.recommend(
            user_data, 
            product_data, 
            n_recommendations=n_recommendations
        )
        
        return jsonify({
            'status': 'success',
            'recommendations': recommendations
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/quantum/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'quantum-recommender'
    })

if __name__ == '__main__':
    port = int(os.getenv('QUANTUM_SERVICE_PORT', 5000))
    app.run(host='0.0.0.0', port=port)  # Enable debug mode for better error messages 