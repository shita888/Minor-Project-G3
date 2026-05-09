import os

def split_file(file_path, chunk_size_mb=90):
    chunk_size = chunk_size_mb * 1024 * 1024
    file_name = os.path.basename(file_path)
    dir_name = os.path.dirname(file_path)
    
    with open(file_path, 'rb') as f:
        chunk_num = 0
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            chunk_num += 1
            chunk_path = os.path.join(dir_name, f"{file_name}.part{chunk_num}")
            with open(chunk_path, 'wb') as chunk_file:
                chunk_file.write(chunk)
            print(f"Created: {chunk_path}")

if __name__ == "__main__":
    split_file("project_model/capacity_model/capacity_model.pkl")
