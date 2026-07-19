#!/usr/bin/env python3
"""Ajouter la colonne filiere au CSV."""
import pandas as pd
from pathlib import Path

csv_path = Path("data/donnees_generees.csv")
df = pd.read_csv(csv_path)

filieres = ['GC', 'GE', 'GM', 'IA', 'IS', 'LT', 'GL', 'SRI']
# Utiliser le hash pour garantir la même filiere pour la même carte
df['filiere'] = df['carte'].apply(lambda x: filieres[hash(x) % len(filieres)])

print("Distribution des filieres:")
print(df['filiere'].value_counts())

df.to_csv(csv_path, index=False)
print(f"\nFichier sauvegardé: {csv_path}")
print(f"Colonnes: {df.columns.tolist()}")
