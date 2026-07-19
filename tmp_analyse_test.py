import pandas as pd

df = pd.read_csv('C:\\Users\\USER\\epl-projet-analyse-flo\\data\\donnees_generees.csv')
df.to_parquet('C:\\Users\\USER\\epl-projet-analyse-flo\\data\\donnees_generees.parquet', index=False)
