#!/usr/bin/env python3
"""
Migration script to alter SQL Server mentors table - change user_id from INT to NVARCHAR(50)
"""

import pymssql
import os

def migrate_sql_server():
    """Migrate SQL Server mentors table to change user_id from INT to NVARCHAR"""
    
    # SQL Server connection details
    server = '127.0.0.1'
    database = 'FlaskApiDB'
    username = 'sa'
    password = 'Aa@123456'
    
    try:
        # Connect to SQL Server
        conn = pymssql.connect(
            server=server,
            user=username,
            password=password,
            database=database
        )
        cursor = conn.cursor()
        
        print(f"Connected to SQL Server: {server}/{database}")
        
        # Check if mentors table exists
        cursor.execute("""
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'mentors'
        """)
        
        if cursor.fetchone()[0] == 0:
            print("Mentors table does not exist. Creating new table...")
            
            # Create new mentors table with correct schema
            cursor.execute("""
                CREATE TABLE mentors (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    user_id NVARCHAR(50) NOT NULL,
                    bio NVARCHAR(500),
                    expertise_areas NVARCHAR(MAX),
                    hourly_rate INT DEFAULT 0,
                    max_sessions_per_day INT DEFAULT 5,
                    status NVARCHAR(20) DEFAULT 'ACTIVE',
                    rating FLOAT DEFAULT 0.0,
                    total_sessions INT DEFAULT 0,
                    created_at DATETIME2 NOT NULL,
                    updated_at DATETIME2 NOT NULL
                )
            """)
            print("Created new mentors table successfully!")
            
        else:
            print("Mentors table exists. Checking if migration is needed...")
            
            # Check current data type of user_id
            cursor.execute("""
                SELECT DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'mentors' AND COLUMN_NAME = 'user_id'
            """)
            
            result = cursor.fetchone()
            if result and result[0] == 'nvarchar':
                print("user_id is already NVARCHAR. No migration needed.")
            else:
                print("Migrating user_id from INT to NVARCHAR(50)...")
                
                # Backup existing data
                cursor.execute("SELECT * FROM mentors")
                existing_data = cursor.fetchall()
                print(f"Found {len(existing_data)} existing mentor records")
                
                # Drop and recreate table (simpler than ALTER for data type change)
                cursor.execute("DROP TABLE mentors")
                print("Dropped old mentors table")
                
                cursor.execute("""
                    CREATE TABLE mentors (
                        id INT IDENTITY(1,1) PRIMARY KEY,
                        user_id NVARCHAR(50) NOT NULL,
                        bio NVARCHAR(500),
                        expertise_areas NVARCHAR(MAX),
                        hourly_rate INT DEFAULT 0,
                        max_sessions_per_day INT DEFAULT 5,
                        status NVARCHAR(20) DEFAULT 'ACTIVE',
                        rating FLOAT DEFAULT 0.0,
                        total_sessions INT DEFAULT 0,
                        created_at DATETIME2 NOT NULL,
                        updated_at DATETIME2 NOT NULL
                    )
                """)
                print("Created new mentors table with NVARCHAR user_id")
                
                # Restore data with converted user_id
                for row in existing_data:
                    # Convert user_id to string if it's not already
                    user_id = str(row[1]) if row[1] is not None else "unknown_user"
                    
                    cursor.execute("""
                        INSERT INTO mentors 
                        (user_id, bio, expertise_areas, hourly_rate, max_sessions_per_day, 
                         status, rating, total_sessions, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (user_id, row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10]))
                
                print(f"Migrated {len(existing_data)} mentor records successfully!")
        
        conn.commit()
        conn.close()
        print("SQL Server migration completed successfully!")
        return True
        
    except Exception as e:
        print(f"SQL Server migration failed: {e}")
        return False

if __name__ == "__main__":
    migrate_sql_server()
