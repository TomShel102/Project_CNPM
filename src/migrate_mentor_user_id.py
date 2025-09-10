#!/usr/bin/env python3
"""
Migration script to change mentor.user_id from INT to VARCHAR(50)
"""

import sqlite3
import os
from pathlib import Path

def migrate_mentor_user_id():
    """Migrate mentor table to change user_id from INT to VARCHAR"""
    
    # Find database file
    db_paths = [
        'default.db',
        'src/default.db',
        'Project_CNPM/src/default.db',
        'Project_CNPM-main/Project_CNPM/src/default.db'
    ]
    
    db_path = None
    for path in db_paths:
        if os.path.exists(path):
            db_path = path
            break
    
    if not db_path:
        print("Database file not found!")
        return False
    
    print(f"Found database at: {db_path}")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if mentors table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='mentors'")
        if not cursor.fetchone():
            print("Mentors table does not exist. Creating new table...")
            
            # Create new mentors table with correct schema
            cursor.execute("""
                CREATE TABLE mentors (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id VARCHAR(50) NOT NULL,
                    bio TEXT,
                    expertise_areas TEXT,
                    hourly_rate INTEGER DEFAULT 0,
                    max_sessions_per_day INTEGER DEFAULT 5,
                    status VARCHAR(20) DEFAULT 'ACTIVE',
                    rating REAL DEFAULT 0.0,
                    total_sessions INTEGER DEFAULT 0,
                    created_at DATETIME NOT NULL,
                    updated_at DATETIME NOT NULL
                )
            """)
            print("Created new mentors table successfully!")
            
        else:
            print("Mentors table exists. Checking schema...")
            
            # Get current schema
            cursor.execute("PRAGMA table_info(mentors)")
            columns = cursor.fetchall()
            
            # Check if user_id is already VARCHAR
            user_id_column = next((col for col in columns if col[1] == 'user_id'), None)
            
            if user_id_column and 'VARCHAR' in user_id_column[2].upper():
                print("user_id is already VARCHAR. No migration needed.")
            else:
                print("Migrating user_id from INTEGER to VARCHAR...")
                
                # Backup existing data
                cursor.execute("SELECT * FROM mentors")
                existing_data = cursor.fetchall()
                
                # Drop and recreate table
                cursor.execute("DROP TABLE mentors")
                
                cursor.execute("""
                    CREATE TABLE mentors (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id VARCHAR(50) NOT NULL,
                        bio TEXT,
                        expertise_areas TEXT,
                        hourly_rate INTEGER DEFAULT 0,
                        max_sessions_per_day INTEGER DEFAULT 5,
                        status VARCHAR(20) DEFAULT 'ACTIVE',
                        rating REAL DEFAULT 0.0,
                        total_sessions INTEGER DEFAULT 0,
                        created_at DATETIME NOT NULL,
                        updated_at DATETIME NOT NULL
                    )
                """)
                
                # Restore data with converted user_id
                for row in existing_data:
                    # Convert user_id to string if it's not already
                    user_id = str(row[1]) if row[1] is not None else "unknown_user"
                    
                    cursor.execute("""
                        INSERT INTO mentors 
                        (id, user_id, bio, expertise_areas, hourly_rate, max_sessions_per_day, 
                         status, rating, total_sessions, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (row[0], user_id, row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10]))
                
                print(f"Migrated {len(existing_data)} mentor records successfully!")
        
        conn.commit()
        conn.close()
        print("Migration completed successfully!")
        return True
        
    except Exception as e:
        print(f"Migration failed: {e}")
        return False

if __name__ == "__main__":
    migrate_mentor_user_id()
