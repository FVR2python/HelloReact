import mysql.connector

def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="Valvas",
        password="1234",
        database="parroquia_db"
    )