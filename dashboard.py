import os

import pandas as pd
import plotly.express as px
import requests
import streamlit as st

st.set_page_config(page_title="FinPilot AI", layout="wide", initial_sidebar_state="collapsed")
DEFAULT_API_URL = os.getenv("FINPILOT_API_URL", "http://localhost:8001")

st.markdown(
    """
    <style>
      :root {
        --fp-navy: #102a43;
        --fp-ink: #172b4d;
        --fp-muted: #486581;
        --fp-slate: #334e68;
        --fp-line: #bcccdc;
        --fp-page: #eef3f7;
        --fp-white: #ffffff;
        --fp-teal: #087f78;
        --fp-teal-dark: #05615c;
        --fp-amber: #9c5c00;
        --fp-red: #b42318;
        --fp-focus: #0f9e92;
        --fp-shadow: 0 3px 10px rgba(16, 42, 67, 0.06);
        --fp-radius: 12px;
      }

      .stApp { background: var(--fp-page, #eef3f7); color: var(--fp-ink, #172b4d); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      .main .block-container { max-width: 1440px; padding: 2.25rem 3rem 4rem; }
      .stApp ::selection { background: #bcebe5; color: var(--fp-navy, #102a43); }
      [data-testid="stSidebar"] { background: var(--fp-navy, #102a43); }
      [data-testid="stSidebar"] p, [data-testid="stSidebar"] label, [data-testid="stSidebar"] span { color: #f7fafc !important; }
      [data-testid="stSidebar"] input { background: #173b5e !important; border-color: #537899 !important; color: #ffffff !important; }

      .fp-masthead { border-bottom: 1px solid var(--fp-line, #bcccdc); margin-bottom: 1.7rem; padding-bottom: 1.5rem; }
      .fp-masthead__brand { color: var(--fp-navy, #102a43); font-size: 1.68rem; font-weight: 750; letter-spacing: -0.035em; line-height: 1.15; }
      .fp-masthead__brand span { color: var(--fp-teal, #087f78); }
      .fp-masthead__summary { color: var(--fp-muted, #486581); font-size: 1rem; line-height: 1.55; margin: 0.38rem 0 0; max-width: 70ch; }
      .fp-source { color: var(--fp-muted, #486581); font-size: 0.82rem; margin: -0.7rem 0 1.1rem; }
      .fp-source strong { color: var(--fp-ink, #172b4d); font-weight: 650; }

      .stTabs [data-baseweb="tab-list"] { border-bottom: 1px solid var(--fp-line, #bcccdc); gap: 1.6rem; }
      .stTabs [data-baseweb="tab"] { color: var(--fp-muted, #486581); font-size: 0.92rem; font-weight: 650; height: 3rem; padding: 0 0.1rem; }
      .stTabs [aria-selected="true"] { color: var(--fp-navy, #102a43) !important; }
      .stTabs [data-baseweb="tab-highlight"] { background-color: var(--fp-teal, #087f78); height: 3px; }
      button:focus-visible, input:focus-visible, [role="combobox"]:focus-visible { outline: 3px solid var(--fp-focus, #0f9e92) !important; outline-offset: 3px; }

      h2, h3 { color: var(--fp-navy, #102a43) !important; letter-spacing: -0.025em; }
      h2 { font-size: 1.33rem !important; margin-top: 1.85rem !important; padding-top: 0 !important; }
      h3 { font-size: 1.04rem !important; }
      [data-testid="stMetric"] { background: var(--fp-white, #ffffff); border: 1px solid var(--fp-line, #bcccdc); border-radius: var(--fp-radius, 12px); box-shadow: var(--fp-shadow, 0 3px 10px rgba(16, 42, 67, 0.06)); min-height: 128px; padding: 1.05rem 1.15rem; }
      [data-testid="stMetricLabel"] { color: var(--fp-muted, #486581) !important; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.02em; }
      [data-testid="stMetricValue"] { color: var(--fp-navy, #102a43) !important; font-size: 1.78rem; font-variant-numeric: tabular-nums; font-weight: 730; }
      [data-testid="stMetricDelta"] { font-variant-numeric: tabular-nums; }
      [data-testid="stDataFrame"] { --gdg-bg-cell: #ffffff; --gdg-bg-cell-medium: #f7fafc; --gdg-bg-header: #e9f0f6; --gdg-border-color: #bcccdc; --gdg-text-dark: #102a43; --gdg-text-medium: #334e68; background: var(--fp-white, #ffffff); border: 1px solid var(--fp-line, #bcccdc); border-radius: var(--fp-radius, 12px); box-shadow: var(--fp-shadow, 0 3px 10px rgba(16, 42, 67, 0.06)); overflow: hidden; }
      [data-testid="stDataFrame"] [role="grid"] { font-variant-numeric: tabular-nums; }
      [data-testid="stPlotlyChart"] { background: var(--fp-white, #ffffff); border: 1px solid var(--fp-line, #bcccdc); border-radius: var(--fp-radius, 12px); box-shadow: var(--fp-shadow, 0 3px 10px rgba(16, 42, 67, 0.06)); padding: 0.35rem; }

      .stButton > button { background: var(--fp-teal, #087f78); border: 1px solid var(--fp-teal, #087f78); border-radius: 8px; color: #ffffff; font-weight: 700; min-height: 2.55rem; padding: 0.45rem 1rem; transition: background-color 160ms ease-out, border-color 160ms ease-out, box-shadow 160ms ease-out; }
      .stButton > button:hover { background: var(--fp-teal-dark, #05615c); border-color: var(--fp-teal-dark, #05615c); box-shadow: 0 3px 10px rgba(5, 97, 92, 0.18); }
      .stButton > button:disabled { background: #aabcc9; border-color: #aabcc9; color: #eef4f8; }
      [data-testid="stTextInput"] input { background: #ffffff !important; border-color: var(--fp-line, #bcccdc) !important; color: var(--fp-navy, #102a43) !important; }
      [data-testid="stTextInput"] input::placeholder { color: var(--fp-muted, #486581) !important; opacity: 1; }
      [data-testid="stSelectbox"] [data-baseweb="select"] { background: #ffffff !important; border-color: var(--fp-line, #bcccdc) !important; color: var(--fp-navy, #102a43) !important; }
      [data-testid="stSelectbox"] [data-baseweb="select"] div { background-color: #ffffff !important; color: var(--fp-navy, #102a43) !important; }
      [data-testid="stSelectbox"] [data-baseweb="select"] svg { fill: var(--fp-navy, #102a43) !important; }
      [data-testid="stTextInput"] input:focus, [data-testid="stSelectbox"] [data-baseweb="select"]:focus-within { border-color: var(--fp-focus, #0f9e92) !important; box-shadow: 0 0 0 3px rgba(15, 158, 146, 0.2) !important; }
      .fp-control-label { color: var(--fp-navy, #102a43); font-size: 0.88rem; font-weight: 700; margin: 0 0 0.35rem; }
      [data-testid="stExpander"] { background: var(--fp-white, #ffffff); border: 1px solid var(--fp-line, #bcccdc); border-radius: var(--fp-radius, 12px); box-shadow: var(--fp-shadow, 0 3px 10px rgba(16, 42, 67, 0.06)); }
      [data-testid="stExpander"] summary { color: var(--fp-navy, #102a43) !important; font-weight: 700; }
      [data-testid="stAlert"], [data-testid="stAlert"] p { color: var(--fp-ink, #172b4d) !important; line-height: 1.5; }
      .fp-note { background: #edf7f5; border: 1px solid #bde3dd; border-radius: 10px; color: #174f4b; line-height: 1.55; padding: 1rem 1.1rem; }
      .fp-note strong { color: #0b4d47; }
      .fp-empty { background: var(--fp-white, #ffffff); border: 1px dashed #9fb3c8; border-radius: var(--fp-radius, 12px); color: var(--fp-muted, #486581); line-height: 1.55; padding: 1.35rem; }
      .fp-empty strong { color: var(--fp-navy, #102a43); display: block; font-size: 1rem; margin-bottom: 0.28rem; }

      @media (max-width: 800px) {
        .main .block-container { padding: 1.35rem 1rem 2.5rem; }
        .fp-masthead { margin-bottom: 1.2rem; padding-bottom: 1.15rem; }
        .fp-masthead__brand { font-size: 1.45rem; }
        .stTabs [data-baseweb="tab-list"] { gap: 0.9rem; overflow-x: auto; }
        .stTabs [data-baseweb="tab"] { font-size: 0.84rem; white-space: nowrap; }
        .main .block-container [data-testid="stHorizontalBlock"] { flex-direction: column; gap: 0.8rem; }
        .main .block-container [data-testid="stHorizontalBlock"] > [data-testid="column"] { flex: 1 1 100% !important; min-width: 100% !important; width: 100% !important; }
        [data-testid="stMetric"] { min-height: auto; }
      }
    </style>
    """,
    unsafe_allow_html=True,
)


def get_json(path: str, **kwargs):
    response = requests.get(f"{st.session_state.api_url}{path}", timeout=8, **kwargs)
    response.raise_for_status()
    return response.json()


def currency(value: float) -> str:
    return f"${value:,.0f}"


def review_priority(position: int) -> str:
    if position == 0:
        return "Review first"
    if position < 4:
        return "High priority"
    return "Review required"


if "api_url" not in st.session_state:
    st.session_state.api_url = DEFAULT_API_URL

with st.sidebar:
    st.caption("FinPilot AI · Settings")
    st.session_state.api_url = st.text_input("API connection", st.session_state.api_url)
    st.caption("Use `http://localhost:8001` while running locally.")

st.markdown(
    """
    <header class="fp-masthead">
      <div class="fp-masthead__brand">FinPilot <span>AI</span></div>
      <p class="fp-masthead__summary">Turn unusual spend into clear, policy-backed decisions.</p>
    </header>
    """,
    unsafe_allow_html=True,
)

try:
    summary = get_json("/summary")
    source = get_json("/data-source")
    transactions = pd.DataFrame(get_json("/transactions", params={"limit": 100}))
except requests.RequestException:
    st.error("FinPilot cannot reach the analysis service.")
    st.code("uvicorn main:app --reload --port 8001", language="bash")
    st.stop()

st.markdown(
    f"<p class='fp-source'><strong>Current data:</strong> {source['source']} &middot; {source['rows']:,} transactions &middot; Processed locally for this session</p>",
    unsafe_allow_html=True,
)
overview, investigate, forecast = st.tabs(["Overview", "Investigate", "Forecast"])

with overview:
    with st.expander("Analyze your own expense data"):
        st.write("Upload a CSV export from your expense or card platform. Required fields: `date`, `merchant`, `category`, and `amount`. Common alternatives such as `vendor` and `transaction_amount` are recognized.")
        st.markdown("<div class='fp-note'><strong>Local session only.</strong> Your file is analyzed on this machine and is never sent to an external service.</div>", unsafe_allow_html=True)
        st.write("")
        uploaded_file = st.file_uploader("Expense CSV", type="csv", label_visibility="collapsed")
        if uploaded_file and st.button("Analyze uploaded data", type="primary"):
            try:
                response = requests.post(f"{st.session_state.api_url}/transactions/upload", files={"file": (uploaded_file.name, uploaded_file.getvalue(), "text/csv")}, timeout=30)
                response.raise_for_status()
                st.success(f"Analyzed {response.json()['rows']} transactions. Refreshing the dashboard…")
                st.rerun()
            except requests.HTTPError as error:
                st.error(error.response.json().get("detail", "Please check the CSV and try again."))
            except requests.RequestException:
                st.error("Upload failed. Confirm that the API is running.")
    st.subheader("Spend risk at a glance")
    one, two, three, four = st.columns(4)
    one.metric("Total spend", currency(summary["total_spend"]))
    two.metric("Items needing review", summary["flagged_transactions"])
    three.metric("Potential exposure", currency(summary["flagged_spend"]))
    four.metric("Spend at risk", f"{summary['flagged_spend_pct']:.1f}%")

    left, right = st.columns([3, 2])
    with left:
        category_risk = pd.DataFrame(summary["category_risk"])
        if not category_risk.empty:
            chart = px.bar(category_risk, x="category", y="flagged_spend", color="flagged_transactions", text_auto=".2s", labels={"category": "Category", "flagged_spend": "Flagged spend ($)", "flagged_transactions": "Items"}, color_continuous_scale="Reds")
            chart.update_layout(
                template="plotly_white",
                margin=dict(l=8, r=12, t=20, b=8),
                showlegend=False,
                paper_bgcolor="#ffffff",
                plot_bgcolor="#ffffff",
                font=dict(color="#102a43", family="Inter, ui-sans-serif, system-ui, sans-serif"),
                hoverlabel=dict(bgcolor="#102a43", bordercolor="#102a43", font=dict(color="#ffffff")),
            )
            chart.update_traces(textfont_color="#102a43", marker_line_color="#ffffff", marker_line_width=1)
            chart.update_xaxes(showgrid=False, showline=True, linecolor="#9fb3c8", tickfont=dict(color="#334e68"), title_font=dict(color="#102a43"))
            chart.update_yaxes(gridcolor="#bcccdc", zerolinecolor="#9fb3c8", showline=True, linecolor="#9fb3c8", tickfont=dict(color="#334e68"), title_font=dict(color="#102a43"))
            st.plotly_chart(chart, use_container_width=True)
    with right:
        st.markdown("#### Start with the clearest signal")
        st.write("Review the highest-priority item first. FinPilot brings together the anomaly signal, relevant policy, and a recommended next step.")
        st.markdown("<div class='fp-note'><strong>Recommended workflow:</strong> open an item from the review queue, inspect the evidence, then document or escalate the decision.</div>", unsafe_allow_html=True)

    st.subheader("Review queue")
    risk_queue = transactions.loc[transactions["is_anomaly"]].copy().sort_values("anomaly_score", ascending=False)
    if risk_queue.empty:
        st.markdown("<div class='fp-empty'><strong>No expenses need review right now.</strong>FinPilot did not find any anomalous items in the current dataset. Upload another CSV or revisit this workspace after new expense data is available.</div>", unsafe_allow_html=True)
    else:
        risk_queue["review_status"] = [review_priority(position) for position in range(len(risk_queue))]
        risk_queue["amount"] = risk_queue["amount"].map(lambda amount: f"${amount:,.2f}")
        risk_queue["anomaly_score"] = risk_queue["anomaly_score"].map(lambda score: f"{score:.2f}")
        risk_queue = risk_queue.rename(columns={"transaction_id": "Transaction", "date": "Date", "merchant": "Merchant", "category": "Category", "amount": "Amount", "anomaly_score": "Risk score", "review_status": "Review status"})
        st.dataframe(risk_queue[["Review status", "Transaction", "Date", "Merchant", "Category", "Amount", "Risk score"]], use_container_width=True, hide_index=True)

with investigate:
    st.subheader("Investigate an expense")
    st.write("Choose a flagged transaction to inspect the signal, relevant policy evidence, confidence, and recommended action.")
    flagged = transactions.loc[transactions["is_anomaly"]].sort_values("anomaly_score", ascending=False).copy()
    if flagged.empty:
        st.markdown("<div class='fp-empty'><strong>Nothing is waiting for investigation.</strong>When FinPilot identifies an unusual expense, it will appear here with the evidence and policy context needed for review.</div>", unsafe_allow_html=True)
    else:
        flagged["label"] = flagged.apply(lambda row: f"{row['transaction_id']} · {row['merchant']} · ${row['amount']:,.2f}", axis=1)
        st.markdown("<p class='fp-control-label' aria-hidden='true'>Transaction to investigate</p>", unsafe_allow_html=True)
        selected_id = st.selectbox(
            "Transaction to investigate",
            flagged["transaction_id"],
            format_func=lambda ident: flagged.loc[flagged["transaction_id"] == ident, "label"].iloc[0],
            label_visibility="collapsed",
            help="Choose a flagged transaction to inspect its evidence and policy context.",
        )
        selected = flagged.loc[flagged["transaction_id"] == selected_id].iloc[0]
        detail_one, detail_two, detail_three = st.columns(3)
        detail_one.metric("Expense", f"${selected['amount']:,.2f}")
        detail_two.metric("Merchant", selected["merchant"])
        detail_three.metric("Category", selected["category"])

        if st.button("Investigate selected expense", type="primary"):
            try:
                response = requests.post(f"{st.session_state.api_url}/investigations", json={"transaction_id": selected_id}, timeout=15)
                response.raise_for_status()
                result = response.json()
                verification = result["verification"]
                st.success(result["summary"])
                st.markdown("#### Recommended action")
                if verification["flags"]:
                    for flag in verification["flags"]:
                        st.warning(f"Review required: {flag.capitalize()}")
                else:
                    st.info("No explicit policy breach was found. Review the documentation before closing this item.")
                st.caption(f"Assessment confidence: {verification['confidence']:.0%}")
                with st.expander("View policy evidence"):
                    for policy in result["policies"]:
                        st.markdown(f"**{policy['policy_id'].replace('-', ' ').title()}**  ")
                        st.write(policy["text"])
            except requests.RequestException:
                st.error("The investigation could not be completed. Confirm that the analysis service is running, then try again.")

with forecast:
    st.subheader("Expected spend")
    st.write("A seven-day forecast helps finance teams anticipate near-term cash needs. Treat it as planning support, not a final approval decision.")
    try:
        forecast_data = pd.DataFrame(get_json("/forecast", params={"days": 7}))
        forecast_data["date"] = pd.to_datetime(forecast_data["date"])
        chart = px.line(forecast_data, x="date", y="predicted_spend", markers=True, labels={"date": "Date", "predicted_spend": "Expected spend ($)"}, color_discrete_sequence=["#087f78"])
        chart.update_layout(
            template="plotly_white",
            margin=dict(l=8, r=12, t=20, b=8),
            paper_bgcolor="#ffffff",
            plot_bgcolor="#ffffff",
            font=dict(color="#102a43", family="Inter, ui-sans-serif, system-ui, sans-serif"),
            hovermode="x unified",
            hoverlabel=dict(bgcolor="#102a43", bordercolor="#102a43", font=dict(color="#ffffff")),
        )
        chart.update_traces(line=dict(color="#087f78", width=3), marker=dict(color="#087f78", size=7, line=dict(color="#ffffff", width=1)))
        chart.update_xaxes(showgrid=False, showline=True, linecolor="#9fb3c8", tickfont=dict(color="#334e68"), title_font=dict(color="#102a43"))
        chart.update_yaxes(gridcolor="#bcccdc", zerolinecolor="#9fb3c8", showline=True, linecolor="#9fb3c8", tickfont=dict(color="#334e68"), title_font=dict(color="#102a43"))
        st.plotly_chart(chart, use_container_width=True)
    except requests.RequestException:
        st.error("Forecast data is unavailable. Confirm that the analysis service is running, then refresh the page.")
