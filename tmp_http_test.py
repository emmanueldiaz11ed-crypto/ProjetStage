import requests

for url in [
    'http://127.0.0.1:8000/analyse/filiere?filiere=IS',
    'http://127.0.0.1:8000/analyse/departement?filieres=IS,GE',
]:
    r = requests.get(url)
    print('URL:', url)
    print('STATUS', r.status_code)
    print(r.json())
    print('---')
