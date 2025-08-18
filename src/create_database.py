import pymssql
import time

def create_database():
    """Create the FlaskApiDB database if it doesn't exist"""
    
    try:
        # Connect to master database
        print("Connecting to SQL Server...")
        conn = pymssql.connect(
            server='127.0.0.1:1433',
            user='sa',
            password='Aa@123456',
            database='master',
            autocommit=True  # Enable autocommit for DDL statements
        )
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute("SELECT name FROM sys.databases WHERE name = 'FlaskApiDB'")
        result = cursor.fetchone()
        
        if result:
            print("✅ Database FlaskApiDB already exists!")
        else:
            # Create database
            print("Creating database FlaskApiDB...")
            cursor.execute("CREATE DATABASE FlaskApiDB")
            print("✅ Database FlaskApiDB created successfully!")
        
        cursor.close()
        conn.close()
        
        # Wait a moment for database to be ready
        time.sleep(2)
        
        # Test connection to FlaskApiDB
        print("\nTesting connection to FlaskApiDB...")
        test_conn = pymssql.connect(
            server='127.0.0.1:1433',
            user='sa',
            password='Aa@123456',
            database='FlaskApiDB'
        )
        test_cursor = test_conn.cursor()
        test_cursor.execute("SELECT @@VERSION")
        version = test_cursor.fetchone()
        print(f"✅ Connected to FlaskApiDB successfully!")
        print(f"SQL Server Version: {version[0]}")
        
        test_cursor.close()
        test_conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nTroubleshooting tips:")
        print("1. Make sure SQL Server container is running: docker ps")
        print("2. Check if port 1433 is available")
        print("3. Try restarting the container: docker restart mentor-booking-sql")
        print("4. Wait a few more seconds for SQL Server to fully start")

if __name__ == "__main__":
    create_database()
