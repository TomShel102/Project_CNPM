from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime
from domain.models.wallet import Wallet, WalletTransaction, TransactionType
from domain.models.iwallet_repository import IWalletRepository
from infrastructure.models.wallet_model import WalletModel, WalletTransactionModel
from infrastructure.databases.mssql import session

class WalletRepository(IWalletRepository):
    def __init__(self):
        self.db: Session = session
    
    def create_wallet(self, wallet: Wallet) -> Wallet:
        wallet_model = WalletModel(
            user_id=wallet.user_id,
            balance=wallet.balance,
            created_at=wallet.created_at,
            updated_at=wallet.updated_at
        )
        self.db.add(wallet_model)
        self.db.commit()
        self.db.refresh(wallet_model)
        
        return Wallet(
            id=wallet_model.id,
            user_id=wallet_model.user_id,
            balance=wallet_model.balance,
            created_at=wallet_model.created_at,
            updated_at=wallet_model.updated_at
        )
    
    def get_wallet_by_user_id(self, user_id: int) -> Optional[Wallet]:
        wallet_model = self.db.query(WalletModel).filter(WalletModel.user_id == user_id).first()
        if not wallet_model:
            return None
        
        return Wallet(
            id=wallet_model.id,
            user_id=wallet_model.user_id,
            balance=wallet_model.balance,
            created_at=wallet_model.created_at,
            updated_at=wallet_model.updated_at
        )
    
    def update_wallet_balance(self, wallet_id: int, new_balance: int) -> bool:
        wallet_model = self.db.query(WalletModel).filter(WalletModel.id == wallet_id).first()
        if not wallet_model:
            return False
        
        wallet_model.balance = new_balance
        wallet_model.updated_at = datetime.now()
        self.db.commit()
        return True
    
    def create_transaction(self, transaction: WalletTransaction) -> WalletTransaction:
        transaction_model = WalletTransactionModel(
            wallet_id=transaction.wallet_id,
            amount=transaction.amount,
            transaction_type=transaction.transaction_type,
            description=transaction.description,
            appointment_id=transaction.appointment_id,
            created_at=transaction.created_at
        )
        self.db.add(transaction_model)
        self.db.commit()
        self.db.refresh(transaction_model)
        
        return WalletTransaction(
            id=transaction_model.id,
            wallet_id=transaction_model.wallet_id,
            amount=transaction_model.amount,
            transaction_type=transaction_model.transaction_type,
            description=transaction_model.description,
            appointment_id=transaction_model.appointment_id,
            created_at=transaction_model.created_at
        )
    
    def get_transactions_by_wallet_id(self, wallet_id: int) -> List[WalletTransaction]:
        transaction_models = self.db.query(WalletTransactionModel).filter(
            WalletTransactionModel.wallet_id == wallet_id
        ).all()
        
        return [
            WalletTransaction(
                id=model.id,
                wallet_id=model.wallet_id,
                amount=model.amount,
                transaction_type=model.transaction_type,
                description=model.description,
                appointment_id=model.appointment_id,
                created_at=model.created_at
            ) for model in transaction_models
        ]
    
    def get_transactions_by_user_id(self, user_id: int) -> List[WalletTransaction]:
        # First get the wallet for the user
        wallet = self.get_wallet_by_user_id(user_id)
        if not wallet:
            return []
        
        return self.get_transactions_by_wallet_id(wallet.id)
    
    def get_transactions_by_type(self, wallet_id: int, transaction_type: TransactionType) -> List[WalletTransaction]:
        transaction_models = self.db.query(WalletTransactionModel).filter(
            WalletTransactionModel.wallet_id == wallet_id,
            WalletTransactionModel.transaction_type == transaction_type
        ).all()
        
        return [
            WalletTransaction(
                id=model.id,
                wallet_id=model.wallet_id,
                amount=model.amount,
                transaction_type=model.transaction_type,
                description=model.description,
                appointment_id=model.appointment_id,
                created_at=model.created_at
            ) for model in transaction_models
        ]
