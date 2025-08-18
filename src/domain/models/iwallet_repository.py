from abc import ABC, abstractmethod
from typing import List, Optional
from domain.models.wallet import Wallet, WalletTransaction, TransactionType

class IWalletRepository(ABC):
    @abstractmethod
    def create_wallet(self, wallet: Wallet) -> Wallet:
        pass
    
    @abstractmethod
    def get_wallet_by_user_id(self, user_id: int) -> Optional[Wallet]:
        pass
    
    @abstractmethod
    def update_wallet_balance(self, wallet_id: int, new_balance: int) -> bool:
        pass
    
    @abstractmethod
    def create_transaction(self, transaction: WalletTransaction) -> WalletTransaction:
        pass
    
    @abstractmethod
    def get_transactions_by_wallet_id(self, wallet_id: int) -> List[WalletTransaction]:
        pass
    
    @abstractmethod
    def get_transactions_by_user_id(self, user_id: int) -> List[WalletTransaction]:
        pass
    
    @abstractmethod
    def get_transactions_by_type(self, wallet_id: int, transaction_type: TransactionType) -> List[WalletTransaction]:
        pass
