import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const CLIENT_REQS = {
    "Client A":[
        {
            jobTitle: "Job 1 for Client A", 
            reqId: "REQ-A1", 
            talents: ["Talent X", "Talent Y", "Talent Z"]
        },
        { 
            jobTitle: "Job 2 for Client A", 
            reqId: "REQ-A2", 
            talents: ["Talent P", "Talent Q"] 
        }
    ],
    "Client B":[
        {
            jobTitle: "Job 1 for Client B", 
            reqId: "REQ-B1", 
            talents: ["Talent M", "Talent N", "Talent O"]
        },
        { 
            jobTitle: "Job 2 for Client B", 
            reqId: "REQ-B2", 
            talents: ["Talent J", "Talent K"] 
        }
    ]
}


export default function PurchaseOrder() {

    const [form,setForm]=useState({
        clientName: "",
        poType: "",
        poNumber: "",
        receivedOn: "",
        receivedFromName: "",
        receivedFromEmail: "",
        poStart: "",
        poEnd: "",
        budget: "",
        currency: "USD",
        reqs:[
            {
                jobTitle: "",
                reqId: "",
                talents: [],
                contractDetails: {},
            }
        ]
    })

    const openReadOnlyPage = () => {
        const newWindow = window.open("", "_blank");

        if (!newWindow) {
            alert("Please allow pop-ups for this site.");
            return;
        }

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>PO Summary</title>
            <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2, h3, h4 { margin-top: 0; }
            .section { 
                padding: 12px; 
                margin-bottom: 15px; 
                border: 1px solid #ccc; 
                border-radius: 6px; 
                background: #fafafa;
            }
            .talent-box {
                background: #eee; 
                padding: 10px; 
                margin-top: 6px; 
                border-radius: 4px;
            }
            </style>
        </head>
        <body>
            
            <h2>Purchase Order Summary</h2>

            <div class="section">
            <h3>General Details</h3>
            <p><strong>Client Name:</strong> ${form.clientName}</p>
            <p><strong>PO Type:</strong> ${form.poType}</p>
            <p><strong>PO Number:</strong> ${form.poNumber}</p>
            <p><strong>Received On:</strong> ${form.receivedOn}</p>
            <p><strong>Received From:</strong> ${form.receivedFromName} (${form.receivedFromEmail})</p>
            <p><strong>PO Start:</strong> ${form.poStart}</p>
            <p><strong>PO End:</strong> ${form.poEnd}</p>
            <p><strong>Budget:</strong> ${form.budget} ${form.currency}</p>
            </div>

            <h3>REQ & Talent Details</h3>

            ${form.reqs
            .map(
                (req, index) => `
                <div class="section">
                <h4>REQ ${index + 1}</h4>
                <p><strong>Job Title:</strong> ${req.jobTitle}</p>
                <p><strong>REQ ID:</strong> ${req.reqId}</p>

                <h4>Talent Details</h4>
                ${
                    req.talents.length === 0
                    ? "<p>No talents selected.</p>"
                    : req.talents
                        .map(
                            (tal) => `
                    <p>${tal}</p>
                    `
                        )
                        .join("")
                }
                </div>
            `
            )
            .join("")}

        </body>
        </html>
        `;

        newWindow.document.open();
        newWindow.document.write(htmlContent);
        newWindow.document.close();

        };

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleClientChange = (client) => {
        setForm((prev) => ({
            ...prev,
            clientName: client,
            reqs: [
                { jobTitle: "", reqId: "", talents: [] } 
            ]
        }));
    };

    const addReq = () => {
        setForm((prev) => ({
        ...prev,
        reqs: [...prev.reqs, { jobTitle: "", reqId: "", talents: [] }],
        }));
    };

    const removeReq = (index) => {
        const updated = [...form.reqs];
        updated.splice(index, 1);
        setForm((prev) => ({ ...prev, reqs: updated }));
    };

    const handleReqChange = (index, field, value) => {
        const updated = [...form.reqs];
        updated[index] = { ...updated[index], [field]: value };

        // When job title changes:
        if (field === "jobTitle") {
            const reqData = CLIENT_REQS[form.clientName]?.find(
            (req) => req.jobTitle === value
            );

            if (reqData) {
            updated[index].reqId = reqData.reqId;
            updated[index].talents = []; // <-- RESET talents to EMPTY (unchecked)
            }
        }

        setForm((prev) => ({ ...prev, reqs: updated }));
    };

    const toggleTalent = (reqIndex, talent) => {
        const updated = [...form.reqs];
        const req = updated[reqIndex];

        const talents = [...req.talents];
        const cd = { ...req.contractDetails };

        const exists = talents.includes(talent);

        if (exists) {
            // Remove talent and remove contract details
            talents.splice(talents.indexOf(talent), 1);
            delete cd[talent];
        } else {
            // Add talent and create empty contract detail
            talents.push(talent);
            cd[talent] = {
            months: "",
            billRate: "",
            currency: "USD",
            standardTime: "",
            standardCurrency: "USD",
            overTime: "",
            overCurrency: "USD"
            };
        }

        updated[reqIndex] = { ...req, talents, contractDetails: cd };
        setForm((prev) => ({ ...prev, reqs: updated }));
    };

    const resetForm = () => {
        setForm({
            clientName: "",
            poType: "",
            poNumber: "",
            receivedOn: "",
            receivedFromName: "",
            receivedFromEmail: "",
            poStart: "",
            poEnd: "",
            budget: "",
            currency: "USD",
            reqs: [
            {
                jobTitle: "",
                reqId: "",
                talents: [],
            },
            ],
        });
    };        

    const validate = () => {
        
        if (!form.clientName) return alert("Client Name is required");
        if (!form.poType) return alert("PO Type is required");
        if (!form.poNumber) return alert("PO Number is required");
        if (!form.receivedOn) return alert("Received On is required");
        if (!form.receivedFromName || !form.receivedFromEmail)
        return alert("Received From Name and Email are required");
        if (!form.poStart) return alert("PO Start Date is required");
        if (!form.poEnd) return alert("PO End Date is required");

        const start = new Date(form.poStart);
        const end = new Date(form.poEnd);
        if (end < start) return alert("PO End Date cannot be before PO Start Date");

        const budgetNum = Number(form.budget);
        if (!Number.isFinite(budgetNum) || budgetNum < 0)
        return alert("Budget must be a positive number");
        if (!Number.isInteger(budgetNum)) return alert("Budget must be an integer");
        if (String(Math.abs(budgetNum)).length > 5)
        return alert("Budget must be at most 5 digits");

        // Passed all checks
        openReadOnlyPage();
    };

    return(
        <>
            <div className="container mt-4">
                <h2 className="text-center mb-4">Purchase Order</h2>
                <div className="row">
                    <div className="mb-3 col-md-3">
                        <label className="form-label">Client Name</label>
                        <select
                        className="form-select"
                        value={form.clientName}
                        onChange={(e) => handleClientChange(e.target.value)}
                        >
                        <option value="">Select Client</option>
                        <option value="Client A">Client A</option>
                        <option value="Client B">Client B</option>
                        </select>
                    </div>
                    <div className="mb-3 col-md-3">
                        <label className="form-label">Purchase Order Type</label>
                        <select
                        className="form-select"
                        value={form.poType}
                        onChange={(e) => handleChange("poType", e.target.value)}
                        >
                        <option value="">Select PO Type</option>
                        <option value="Group">Group PO</option>
                        <option value="Individual">Individual PO</option>
                        </select>
                    </div>
                    <div className="mb-3 col-md-3">
                        <label className="form-label">Purchase Order Number</label>
                        <input
                        type="text"
                        className="form-control"
                        placeholder="PO Number"
                        value={form.poNumber}
                        onChange={(e) => handleChange("poNumber", e.target.value)}
                        />
                    </div>
                    <div className="mb-3 col-md-3">
                        <label className="form-label">Received On</label>
                        <input
                        type="date"
                        className="form-control"
                        value={form.receivedOn}
                        onChange={(e) => handleChange("receivedOn", e.target.value)}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="mb-3 col-md-3">
                        <label className="form-label">Received From Name</label>
                        <input
                        type="text"
                        className="form-control"
                        placeholder="Name"
                        value={form.receivedFromName}
                        onChange={(e) => handleChange("receivedFromName", e.target.value)}
                        />
                    </div>
                    <div className="mb-3 col-md-3">
                        <label className="form-label">Received From Email</label>
                        <input
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        value={form.receivedFromEmail}
                        onChange={(e) => handleChange("receivedFromEmail", e.target.value)}
                        />
                    </div>
                    <div className="mb-3 col-md-3">
                        <div className="row">
                            <div className="col-6">
                                <label className="form-label">PO Start Date</label>
                                <input
                                type="date"
                                className="form-control"
                                value={form.poStart}
                                onChange={(e) => handleChange("poStart", e.target.value)}
                                />
                            </div>

                            <div className="col-6">
                                <label className="form-label">PO End Date</label>
                                <input
                                type="date"
                                className="form-control"
                                value={form.poEnd}
                                onChange={(e) => handleChange("poEnd", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mb-3 col-md-3">
                        <div className="row">
                            <div className="col-6">
                                <label className="form-label">Budget</label>
                                <input
                                type="number"
                                className="form-control"
                                placeholder="Budget(max 5 digits)"
                                value={form.budget}
                                onChange={(e) => handleChange("budget", e.target.value)}
                                />
                            </div>
                            <div className="col-6">
                                <label className="form-label">Currency</label>
                                <select
                                className="form-select"
                                value={form.currency}
                                onChange={(e) => handleChange("currency", e.target.value)}
                                >
                                <option value="">Select Currency</option>
                                <option value="USD">USD</option>
                                <option value="INR">INR</option>
                                <option value="EUR">EUR</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex mb-3 mt-3">
                    <h4>Talent Details:</h4>
                    {form.poType === "Group" && (
                        <button
                            type="button"
                            className="btn btn-secondary ms-auto"
                            onClick={addReq}
                        >
                            Add Another
                        </button>
                    )}
                </div>

                





                {form.reqs.map((req, index) => (
                    <div key={index} className="card p-3 mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="mb-0">REQ {index + 1}</h5>
                        {form.reqs.length > 1 && (
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeReq(index)}
                        >
                            Remove
                        </button>
                        )}
                    </div>

                    <div className="row">
                        <div className="mb-3 col-3">
                            <label className="form-label">Job Title</label>
                            <select
                                className="form-select"
                                value={req.jobTitle}
                                onChange={(e) => handleReqChange(index, "jobTitle", e.target.value)}
                                >
                                <option value="">Select Job Title</option>

                                {CLIENT_REQS[form.clientName]?.map((r) => (
                                    <option key={r.reqId} value={r.jobTitle}>
                                    {r.jobTitle}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3 col-3">
                            <label className="form-label">REQ ID</label>
                            <input
                            type="text"
                            className="form-control"
                            placeholder="Auto-filled REQ ID"
                            value={req.reqId}
                            readOnly
                            />
                        </div>
                    </div>

                    <div className="mb-2">Talents:</div>
                        {CLIENT_REQS[form.clientName]
                        ?.find((r) => r.jobTitle === req.jobTitle)
                        ?.talents.map((tal) => (
                            <div className="form-check" key={tal}>
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id={`req-${index}-tal-${tal}`}
                                checked={req.talents.includes(tal)}
                                onChange={() => toggleTalent(index, tal)}
                            />
                            <label className="form-check-label" htmlFor={`req-${index}-tal-${tal}`}>
                                {tal}
                            </label>

                            </div>
                        ))}
                    </div>
                ))}

                <div className="d-flex gap-2 mb-3">
                    <button type="button" className="btn btn-primary" onClick={validate}>
                        Submit
                    </button>
                    <button type="button" className="btn btn-secondary me-2" onClick={resetForm}>
                        Reset
                    </button>
                </div>                    
                
            </div>    
        </>
    )
}