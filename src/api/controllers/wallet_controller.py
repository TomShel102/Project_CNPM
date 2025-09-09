from flask import Blueprint, request, jsonify
from services.wallet_service import WalletService
from infrastructure.repositories.wallet_repository import WalletRepository
from domain.models.wallet import TransactionType
from datetime import datetime
import json

bp = Blueprint('wallet', __name__, url_prefix='/api/wallet')

# Initialize services
wallet_repository = WalletRepository()
wallet_service = WalletService(wallet_repository)

@bp.route('/', methods=['GET'])
def get_wallet():
    """Get wallet information for current user"""
    try:
        user_id = request.args.get('user_id', type=int)
        if not user_id:
            return jsonify({
                'success': False,
                'message': 'User ID is required'
            }), 400
        
        wallet = wallet_service.get_wallet_by_user_id(user_id)
        if not wallet:
            # Create new wallet if doesn't exist
            wallet = wallet_service.create_wallet(user_id)
        
        return jsonify({
            'success': True,
            'data': {
                'id': wallet.id,
                'user_id': wallet.user_id,
                'balance': wallet.balance,
                'total_spent': wallet.total_spent,
                'total_earned': wallet.total_earned,
                'created_at': wallet.created_at.isoformat() if wallet.created_at else None,
                'updated_at': wallet.updated_at.isoformat() if wallet.updated_at else None
            },
            'message': 'Wallet retrieved successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@bp.route('/transactions', methods=['GET'])
def get_transactions():
    """Get wallet transactions for current user"""
    try:
        user_id = request.args.get('user_id', type=int)
        if not user_id:
            return jsonify({
                'success': False,
                'message': 'User ID is required'
            }), 400
        
        transactions = wallet_service.get_transactions_by_user_id(user_id)
        
        transaction_list = []
        for transaction in transactions:
            transaction_list.append({
                'id': transaction.id,
                'wallet_id': transaction.wallet_id,
                'amount': transaction.amount,
                'type': transaction.type.value,
                'description': transaction.description,
                'created_at': transaction.created_at.isoformat() if transaction.created_at else None
            })
        
        return jsonify({
            'success': True,
            'data': transaction_list,
            'message': f'Found {len(transaction_list)} transactions'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@bp.route('/add-points', methods=['POST'])
def add_points():
    """Add points to wallet"""
    try:
        data = request.get_json()
        
        user_id = data.get('user_id')
        amount = data.get('amount')
        description = data.get('description', 'Nạp điểm')
        
        if not user_id or not amount:
            return jsonify({
                'success': False,
                'message': 'User ID and amount are required'
            }), 400
        
        if amount <= 0:
            return jsonify({
                'success': False,
                'message': 'Amount must be positive'
            }), 400
        
        wallet = wallet_service.add_points(user_id, amount, description)
        
        return jsonify({
            'success': True,
            'data': {
                'id': wallet.id,
                'user_id': wallet.user_id,
                'balance': wallet.balance,
                'total_earned': wallet.total_earned
            },
            'message': f'Added {amount} points successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@bp.route('/spend-points', methods=['POST'])
def spend_points():
    """Spend points from wallet"""
    try:
        data = request.get_json()
        
        user_id = data.get('user_id')
        amount = data.get('amount')
        description = data.get('description', 'Sử dụng điểm')
        
        if not user_id or not amount:
            return jsonify({
                'success': False,
                'message': 'User ID and amount are required'
            }), 400
        
        if amount <= 0:
            return jsonify({
                'success': False,
                'message': 'Amount must be positive'
            }), 400
        
        wallet = wallet_service.spend_points(user_id, amount, description)
        
        if not wallet:
            return jsonify({
                'success': False,
                'message': 'Insufficient balance'
            }), 400
        
        return jsonify({
            'success': True,
            'data': {
                'id': wallet.id,
                'user_id': wallet.user_id,
                'balance': wallet.balance,
                'total_spent': wallet.total_spent
            },
            'message': f'Spent {amount} points successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
