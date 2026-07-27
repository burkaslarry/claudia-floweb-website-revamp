# Claudia Floweb prototype

Mobile-first prototype for discovering flower vending machines and florists.

## Structure

- `frontend/` — Next.js, TypeScript, and Tailwind CSS
- `backend/` — Python and FastAPI location API
- `docs/` — source client documents and artwork (kept unchanged)

The locations currently shown are prototype data and must be replaced with
confirmed addresses before launch.

## Run locally

Start the backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

In another terminal, start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:3000>. API documentation is available at
<http://localhost:8000/docs>.

## SHOPLINE login

Open <https://admin.shoplineapp.com/>, enter the merchant account email and
password, then choose the correct shop. Use the account recovery link on the
login screen if the password is unavailable. Staff members need an invitation
from the shop owner before they can sign in.
