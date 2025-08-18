from sqlalchemy import create_engine, text
from config import Config

def check_tables():
    """Check what tables were created in the database using SQLAlchemy"""
    
    try:
        # Use the same connection string as the main application
        engine = create_engine(Config.DATABASE_URI)
        
        print("Connecting to FlaskApiDB using SQLAlchemy...")
        print(f"Connection string: {Config.DATABASE_URI}")
        
        with engine.connect() as connection:
            # Get all tables
            result = connection.execute(text("""
                SELECT TABLE_NAME 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_TYPE = 'BASE TABLE'
                ORDER BY TABLE_NAME
            """))
            
            tables = result.fetchall()
            
            print(f"\n✅ Found {len(tables)} tables in FlaskApiDB:")
            print("-" * 50)
            
            for table in tables:
                table_name = table[0]
                print(f"📋 {table_name}")
                
                # Get column information for each table
                col_result = connection.execute(text(f"""
                    SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = '{table_name}'
                    ORDER BY ORDINAL_POSITION
                """))
                
                columns = col_result.fetchall()
                for col in columns:
                    col_name, data_type, nullable = col
                    nullable_str = "NULL" if nullable == "YES" else "NOT NULL"
                    print(f"   └─ {col_name}: {data_type} ({nullable_str})")
                print()
        
        print("🎉 Database setup completed successfully!")
        print("\nYou can now:")
        print("1. Access the API at: http://localhost:6868")
        print("2. View Swagger docs at: http://localhost:6868/docs")
        print("3. Use the API endpoints to create mentors and appointments")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print(f"\nConnection string used: {Config.DATABASE_URI}")

if __name__ == "__main__":
    check_tables()
