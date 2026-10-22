# MediChain AI – Blockchain-Based Hospital Management System

MediChain AI is a secure hospital management system that combines AI-assisted pre-consultation, appointment management, patient-controlled medical record access, and blockchain-based integrity verification.

The system is designed for three main roles: **Patient, Doctor, and Admin**.

## Features

### Patient
- Patient registration and login
- AI-assisted pre-consultation
- Symptom-based department suggestion
- Doctor recommendation based on specialization
- Appointment booking
- View booked appointments
- View medical records
- Verify medical record integrity
- Grant or revoke doctor access
- View medical record access logs

### Doctor
- Doctor login
- Manage appointments
- View AI pre-consultation summary
- Create medical records
- Access patient records with consent verification
- Verify record integrity using blockchain
- Update medical records
- Create blockchain-backed record versions
- View medical record audit history

### Admin
- Admin login
- Add doctors
- Manage doctors
- Assign doctor specialization

## Blockchain Integration

Medical record data is stored in MongoDB.

A SHA-256 hash of each medical record is generated and stored in an Ethereum-compatible smart contract.

The blockchain layer is used to:
- Verify medical record integrity
- Detect unauthorized record modification
- Maintain append-only record hash versions
- Track authorized medical record updates

The current project uses **Ganache** as a local Ethereum-compatible blockchain network for development and demonstration.

## AI-Assisted Pre-Consultation

The AI-assisted module collects patient symptoms through a structured question-based flow.

It generates:
- Main concern
- Symptom summary
- Suggested department
- Priority level
- Doctor recommendation

This feature is designed for pre-consultation assistance and hospital routing only. It is not intended to provide a medical diagnosis.

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- CSS

### Backend
- Node.js
- Express.js
- TypeScript
- JWT Authentication
- bcrypt

### Database
- MongoDB
- Mongoose

### Blockchain
- Solidity
- Ganache
- ethers.js
- SHA-256

## Project Structure

```text
Blockchain-Hospital-Management-System/
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── blockchain/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── scripts/
│   │   └── services/
│   └── package.json
│
└── README.md
```

## Environment Configuration

Create a `.env` file inside the `server` folder.

Example:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/medichain_ai
JWT_SECRET=your_secret_key

BLOCKCHAIN_RPC_URL=http://127.0.0.1:7545
MEDICAL_LEDGER_ADDRESS=your_deployed_contract_address
```

Do not upload the `.env` file to GitHub.

## Installation

Clone the repository:

```bash
git clone https://github.com/ameenroohul564-sketch/MediChain-AI-Blockchain-Hospital-Management-System.git
```

### Install Backend Dependencies

```bash
cd server
npm install
```

### Install Frontend Dependencies

```bash
cd ../client
npm install
```

## Running the Project

Open three terminals.

### Terminal 1 – Start Ganache

```bash
cd server
npm run blockchain
```

### Terminal 2 – Start Backend

```bash
cd server
npm run dev
```

Backend:

```text
http://localhost:5000
```

### Terminal 3 – Start Frontend

```bash
cd client
npm run dev
```

Open the URL displayed by Vite in the terminal.

## Smart Contract Deployment

The smart contract only needs to be redeployed if the local Ganache blockchain is reset or deleted.

Deploy using:

```bash
cd server
npm run deploy-ledger
```

Copy the generated contract address and update:

```env
MEDICAL_LEDGER_ADDRESS=0x...
```

in `server/.env`.

If the existing Ganache blockchain data is preserved, redeployment is normally not required.

## Medical Record Security Flow

```text
Doctor creates medical record
        ↓
Medical record stored in MongoDB
        ↓
SHA-256 hash generated
        ↓
Hash stored in smart contract
        ↓
Patient / Doctor requests verification
        ↓
Current record hash recalculated
        ↓
Compared with latest blockchain hash
        ↓
Match → Record Verified
Mismatch → Possible Tampering Detected
```

## Access Control

The project uses:
- JWT-based authentication
- Role-based authorization
- Patient consent management
- Medical record access logging

Doctors can only access protected patient medical records when appropriate patient consent is available.

## Authors

- Dominik Sanjay.M — 24625173
- Roohul Ameen.A — 24625226
- Sudharsan.V — 24625230

## Project Status

Core functionality completed:
- Authentication
- Patient workflow
- Doctor workflow
- Admin workflow
- Appointment management
- AI-assisted pre-consultation
- Medical record management
- Blockchain integrity verification
- Medical record version history
- Patient consent management
- Record access logging