from datetime import datetime
from typing import Optional
from enum import Enum

class TransactionType(Enum):
    EARNED = "earned"
    SPENT = "spent"
    REFUNDED = "refunded"
    BONUS = "bonus"

class Wallet:
    def __init__(self,
                 id: Optional[int] = None,
                 user_id: int = 0,
                 balance: int = 0,
                 created_at: Optional[datetime] = None,
                 updated_at: Optional[datetime] = None):
        self.id = id
        self.user_id = user_id
        self.balance = balance
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()

class WalletTransaction:
    def __init__(self,
                 id: Optional[int] = None,
                 wallet_id: int = 0,
                 amount: int = 0,
                 transaction_type: TransactionType = TransactionType.EARNED,
                 description: str = "",
                 appointment_id: Optional[int] = None,
                 created_at: Optional[datetime] = None):
        self.id = id
        self.wallet_id = wallet_id
        self.amount = amount
        self.transaction_type = transaction_type
        self.description = description
        self.appointment_id = appointment_id
        self.created_at = created_at or datetime.now()
