import random
import math
import numpy as np

class SimpleQuantumSimulator:
    """A simple quantum simulator that doesn't rely on Qiskit."""
    
    def __init__(self):
        self.state = None
        self.num_qubits = 0
    
    def initialize(self, num_qubits):
        """Initialize a quantum state with the given number of qubits."""
        self.num_qubits = num_qubits
        self.state = np.zeros(2**num_qubits, dtype=complex)
        self.state[0] = 1.0  # Start in |0...0⟩ state
        return self
    
    def h(self, qubit):
        """Apply a Hadamard gate to the specified qubit."""
        if self.state is None:
            raise ValueError("Quantum state not initialized")
        
        # Create a new state vector
        new_state = np.zeros_like(self.state)
        
        # Apply Hadamard gate to the specified qubit
        for i in range(len(self.state)):
            # Get the binary representation of the state index
            binary = format(i, f'0{self.num_qubits}b')
            
            # Apply Hadamard gate
            if binary[qubit] == '0':
                # |0⟩ -> (|0⟩ + |1⟩)/√2
                new_i = int(binary[:qubit] + '0' + binary[qubit+1:], 2)
                new_state[new_i] += self.state[i] / math.sqrt(2)
                
                flipped = binary[:qubit] + '1' + binary[qubit+1:]
                new_i = int(flipped, 2)
                new_state[new_i] += self.state[i] / math.sqrt(2)
            else:
                # |1⟩ -> (|0⟩ - |1⟩)/√2
                new_i = int(binary[:qubit] + '0' + binary[qubit+1:], 2)
                new_state[new_i] += self.state[i] / math.sqrt(2)
                
                flipped = binary[:qubit] + '1' + binary[qubit+1:]
                new_i = int(flipped, 2)
                new_state[new_i] -= self.state[i] / math.sqrt(2)
        
        # Normalize the state
        norm = np.sqrt(np.sum(np.abs(new_state)**2))
        self.state = new_state / norm
        
        return self
    
    def measure(self, qubits=None):
        """Measure the specified qubits and return the result."""
        if self.state is None:
            raise ValueError("Quantum state not initialized")
        
        if qubits is None:
            qubits = list(range(self.num_qubits))
        
        # Calculate probabilities
        probs = np.abs(self.state)**2
        
        # Sample from the probability distribution
        result = np.random.choice(len(probs), p=probs)
        
        # Convert to binary
        binary = format(result, f'0{self.num_qubits}b')
        
        # Extract measured qubits
        measured = ''.join(binary[i] for i in qubits)
        
        return measured

# Example usage
def generate_random_number(num_bits=8):
    """Generate a random number using quantum simulation."""
    simulator = SimpleQuantumSimulator()
    simulator.initialize(num_bits)
    
    # Apply Hadamard gates to all qubits
    for i in range(num_bits):
        simulator.h(i)
    
    # Measure all qubits
    result = simulator.measure()
    
    # Convert binary to integer
    return int(result, 2)

def flip_coin():
    """Flip a quantum coin."""
    simulator = SimpleQuantumSimulator()
    simulator.initialize(1)
    simulator.h(0)
    result = simulator.measure()
    return 'Heads' if result == '1' else 'Tails' 