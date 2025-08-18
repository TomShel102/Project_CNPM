from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum, ForeignKey
from infrastructure.databases.base import Base
from domain.models.wallet import TransactionType

class WalletModel(Base):
    __tablename__ = 'wallets'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    balance = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)

class WalletTransactionModel(Base):
    __tablename__ = 'wallet_transactions'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    wallet_id = Column(Integer, ForeignKey('wallets.id'), nullable=False)
    amount = Column(Integer, nullable=False)
    transaction_type = Column(SQLEnum(TransactionType), nullable=False)
    description = Column(String(255), nullable=True)
    appointment_id = Column(Integer, ForeignKey('appointments.id'), nullable=True)
    created_at = Column(DateTime, nullable=False)
    
