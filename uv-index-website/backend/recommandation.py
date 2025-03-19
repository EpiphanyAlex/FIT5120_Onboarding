import requests
import pandas as pd
from datetime import datetime

# Update this path to match where your CSV is located
inci_mortality_df = pd.read_csv(r'cancer_incidence_mortality.csv')

def parse_iso_time(iso_str):
    """Convert an ISO8601 string to a Python datetime."""
    return datetime.fromisoformat(iso_str.replace("Z", "+00:00"))

def recommend_uv(skin_type):
    """Return a concise UV recommendation summary based on skin type and location."""

    # --- 1. Get user location via ipinfo.io ---
    loc_response = requests.get("https://ipinfo.io/json")
    loc_data = loc_response.json()
    lat, lon = map(float, loc_data["loc"].split(","))
    user_state = loc_data.get("region", "").strip()

    # --- 2. Fetch UV data from OpenUV ---
    uv_url = "https://api.openuv.io/api/v1/uv"
    headers = {"x-access-token": "openuv-13qzhcrm8fopbp3-io"}  
    params = {"lat": lat, "lng": lon}
    uv_data = requests.get(uv_url, headers=headers, params=params).json()
    # print("OpenUV response:", uv_data)  # For debugging

    if "result" not in uv_data:
        error_msg = uv_data.get("error", "Unknown error")
        return f"OpenUV Error: {error_msg}"

    # --- 3. Calculate time until sunset ---
    uv_time = parse_iso_time(uv_data["result"]["uv_time"])
    sunset_time = parse_iso_time(uv_data["result"]["sun_info"]["sun_times"]["sunset"])
    minutes_until_sunset = (sunset_time - uv_time).total_seconds() / 60

    # --- 4. Determine safe exposure time (may be None on free plans) ---
    skin_type = int(skin_type)
    exposure_key = f"st{skin_type}"
    safe_time = uv_data["result"]["safe_exposure_time"].get(exposure_key)
    if safe_time is None:
        safe_time_display = "N/A"
    else:
        safe_time_display = f"{safe_time} sec"

    # --- 5. UV index & short recommendation ---
    uv_index = uv_data["result"]["uv"]
    if uv_index >= 6:
        uv_recommendation = "High UV: Use SPF 30+, wear protective clothing, seek shade."
    elif uv_index >= 3:
        uv_recommendation = "Moderate UV: Use sunscreen if outdoors, wear hat/sunglasses."
    else:
        uv_recommendation = "Low UV: Minimal risk, but consider protection if out long."

    # --- 6. Melanoma incidence data (simplified) ---
    possible_state_cols = [col for col in inci_mortality_df.columns
                           if "state" in col.lower() and "territory" in col.lower()]
    state_col = possible_state_cols[0] if possible_state_cols else "State or Territory"

    state_data = inci_mortality_df[
        inci_mortality_df[state_col].str.strip().str.lower() == user_state.lower()
    ]

    rate_cols = [col for col in inci_mortality_df.columns if "2024 australian population" in col.lower()]
    rate_col = rate_cols[0] if rate_cols else "Age-standardised rate (2024 Australian population)"

    melanoma_data = state_data[state_data["Cancer group/site"].str.contains("Melanoma", case=False, na=False)]
    if not melanoma_data.empty:
        melanoma_data.loc[:, rate_col] = pd.to_numeric(melanoma_data[rate_col], errors="coerce")
        state_melanoma_rate = melanoma_data[rate_col].mean()
    else:
        state_melanoma_rate = None

    national_data = inci_mortality_df[
        inci_mortality_df["Cancer group/site"].str.contains("Melanoma", case=False, na=False)
    ]
    if not national_data.empty:
        national_data.loc[:, rate_col] = pd.to_numeric(national_data[rate_col], errors="coerce")
        national_melanoma_rate = national_data[rate_col].mean()
    else:
        national_melanoma_rate = None

    if state_melanoma_rate and national_melanoma_rate:
        if state_melanoma_rate > national_melanoma_rate:
            cancer_risk = "Above-average melanoma incidence. Consider higher SPF and checks."
        else:
            cancer_risk = "At/below national melanoma incidence. Maintain good sun protection."
    else:
        cancer_risk = "Melanoma incidence data unavailable."

    # --- 7. Build the summary text ---

    # Case A: Sunset is in the future (minutes_until_sunset >= 0)
    if minutes_until_sunset >= 0:
        summary = f"""
Safe Exposure: {safe_time_display}
Sunset in: {minutes_until_sunset:.1f} min
Recommendation: {uv_recommendation}
Cancer Risk: {cancer_risk}
        """.strip()
    else:
        # Case B: Sunset has already happened
        summary = f"""
Sunset has already occurred.
No additional sun protection needed at this time.
Cancer Risk: {cancer_risk}
        """.strip()

    return summary
