import pandas as pd

from app.services.data_processing import validate_schema
from app.services.upload import validate_uploaded_data


def test_validate_schema_accepts_essential_columns_only():
    df = pd.DataFrame(
        [
            {"note": 12.5, "anonymat": "A1", "ue": "UE-101"},
            {"note": 10.0, "anonymat": "A2", "ue": "UE-102"},
        ]
    )

    validate_schema(df)


def test_validate_uploaded_data_drops_incomplete_rows_but_keeps_essential_rows():
    df = pd.DataFrame(
        [
            {"note": 12.5, "anonymat": "A1", "ue": "UE-101", "filiere": "INFO"},
            {"note": None, "anonymat": "A2", "ue": "UE-102", "filiere": "INFO"},
            {"note": 8.0, "anonymat": "", "ue": "UE-103", "filiere": "INFO"},
            {"note": 15.0, "anonymat": "A4", "ue": "", "filiere": "INFO"},
            {"note": 14.0, "anonymat": "A5", "ue": "UE-104", "filiere": "INFO"},
        ]
    )

    cleaned, warnings = validate_uploaded_data(df)

    assert len(cleaned) == 2
    assert set(cleaned["anonymat"]) == {"A1", "A5"}
    assert any("supprimée" in w for w in warnings)
