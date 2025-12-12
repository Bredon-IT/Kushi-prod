/* FULL UPDATED WORKING FILE — PREFILL + AUTO CATEGORY/SUBCATEGORY + INSPECTION SUPPORTED */

import React, { useEffect, useState } from "react";
import axios from "axios";
import Global_API_BASE from "../../services/GlobalConstants";
import BookingsAPIService from "../../services/BookingAPIService";
import { Button } from "../ui/Button";
import { X } from "lucide-react";

/* ---------- TIME FORMATTER ---------- */
const convert24To12 = (time24?: string) => {
  if (!time24) return "";
  if (time24.includes("AM") || time24.includes("PM")) return time24;
  const [hhStr, mmStr] = time24.split(":");
  let hh = Number(hhStr);
  const mm = (mmStr || "00").padStart(2, "0");
  const ampm = hh >= 12 ? "PM" : "AM";
  hh = hh % 12;
  if (hh === 0) hh = 12;
  return `${String(hh).padStart(2, "0")}:${mm} ${ampm}`;
};

interface Props {
  onClose: () => void;
  onCreated: () => void;
  prefillData?: any;
}

type ServiceEntry = {
  service_id: any;
  service_category: string;
  service_type: string;
  service_name: string;
  service_package: string;
};

type ServiceRow = {
  category: string;
  subcategory: string;
  serviceId: string;
  serviceName: string;
  packageId: string;
  price: number;

  subcategories: string[];
  servicesList: Array<ServiceEntry>;
  packages: Array<{ service_id: any; fullLabel: string; price: any }>;
  inspectionRequired: boolean;
};

const AdminCreateBookingModal: React.FC<Props> = ({
  onClose,
  onCreated,
  prefillData,
}) => {
  /* ---------- FORM STATE ---------- */
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerNumber: "",
    addressLine1: "",
    city: "",
    pincode: "",
    bookingServiceName: "",
    bookingDate: "",
    bookingTime: "",
    bookingAmount: 0,
    remarks: "",
  });

  /* ---------- SERVICE STATES ---------- */
  const [allServices, setAllServices] = useState<ServiceEntry[]>([]);
  const [serviceRows, setServiceRows] = useState<ServiceRow[]>([
    {
      category: "",
      subcategory: "",
      serviceId: "",
      serviceName: "",
      packageId: "",
      price: 0,
      subcategories: [],
      servicesList: [],
      packages: [],
      inspectionRequired: false,
    },
  ]);

  const [gst, setGST] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [saving, setSaving] = useState(false);

  /* ---------- LOAD ALL SERVICES ---------- */
  useEffect(() => {
    axios
      .get(`${Global_API_BASE}/api/customers/all-services`)
      .then((res) => setAllServices(res.data || []))
      .catch(() => console.log("Failed to load services"));
  }, []);

  /* ALL CATEGORIES */
  const categories = Array.from(
    new Set(allServices.map((s) => s.service_category))
  ).filter(Boolean);

  const parsePackages = (str: string) =>
    (str || "")
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((pkg) => {
        const [label, price] = pkg.split(":");
        return { label, price };
      });

  /* ---------- INPUT HANDLER ---------- */
  const handleChange = (e: any) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  /* ---------- ⭐ AUTO-FILL CUSTOMER DETAILS ---------- */
  useEffect(() => {
    if (!prefillData) return;

    setForm((p) => ({
      ...p,
      customerName: prefillData.name || "",
      customerEmail: prefillData.email || "",
      customerNumber: prefillData.phone || "",
      addressLine1: prefillData.location || "",
      bookingServiceName: prefillData.serviceCategory || "",
    }));
  }, [prefillData]);

  /* ---------- ⭐ AUTO SELECT CATEGORY + SUBCATEGORY (UPDATED FINAL VERSION) ---------- */
 useEffect(() => {
  if (!prefillData) return;
  if (allServices.length === 0) return;

  const category = prefillData.serviceCategory || "";
  let subcat = prefillData.subcategory || "";

  const norm = (v: string) => (v || "").trim().toLowerCase();

  // Convert service name → service type if needed
  if (
    subcat &&
    !allServices.some((s) => norm(s.service_type) === norm(subcat))
  ) {
    const match = allServices.find(
      (s) => norm(s.service_name) === norm(subcat)
    );
    if (match) subcat = match.service_type;
  }

  setServiceRows((prev) => {
    const updated = [...prev];

    updated[0].category = category;

    updated[0].subcategories = Array.from(
      new Set(
        allServices
          .filter((s) => norm(s.service_category) === norm(category))
          .map((s) => s.service_type)
      )
    );

    updated[0].subcategory = subcat;

    updated[0].servicesList = allServices.filter(
      (s) => norm(s.service_type) === norm(subcat)
    );

    return updated;
  });
}, [prefillData, allServices]);


  /* ---------- CATEGORY CHANGE ---------- */
  const handleCategoryChange = (index: number, category: string) => {
    const subCats = Array.from(
      new Set(
        allServices
          .filter((s) => s.service_category === category)
          .map((s) => s.service_type)
      )
    );

    const updated = [...serviceRows];
    updated[index] = {
      category,
      subcategory: "",
      serviceId: "",
      serviceName: "",
      packageId: "",
      price: 0,
      subcategories: subCats,
      servicesList: [],
      packages: [],
      inspectionRequired: false,
    };
    setServiceRows(updated);
  };

  /* ---------- SUBCATEGORY CHANGE ---------- */
  const handleSubCategoryChange = (index: number, subcat: string) => {
    const list = allServices.filter((s) => s.service_type === subcat);

    const updated = [...serviceRows];
    updated[index].subcategory = subcat;
    updated[index].servicesList = list;
    updated[index].serviceId = "";
    updated[index].serviceName = "";
    updated[index].packages = [];
    updated[index].packageId = "";
    updated[index].price = 0;
    updated[index].inspectionRequired = false;
    setServiceRows(updated);
  };

  /* ---------- SERVICE CHANGE ---------- */
  const handleServiceSelect = (index: number, serviceId: string) => {
    const updated = [...serviceRows];

    const found =
      updated[index].servicesList.find((s) => s.service_id == serviceId) ||
      allServices.find((s) => s.service_id == serviceId);

    if (!found) return;

    const packagesParsed = parsePackages(found.service_package).map((pkg) => ({
      service_id: found.service_id,
      fullLabel: `${found.service_name} – ${pkg.label}`,
      price: pkg.price,
    }));

    updated[index].serviceId = String(found.service_id);
    updated[index].serviceName = found.service_name;
    updated[index].packages = packagesParsed;
    updated[index].packageId = "";
    updated[index].price = 0;

    updated[index].inspectionRequired =
      !found.service_package || found.service_package.trim() === "";

    setServiceRows(updated);
  };

  /* ---------- PACKAGE CHANGE ---------- */
  const handlePackageChange = (index: number, pkgId: string) => {
    const updated = [...serviceRows];

    updated[index].packageId = pkgId;

    const selected = updated[index].packages.find(
      (p) => `${p.service_id}-${p.fullLabel}` === pkgId
    );

    updated[index].price = selected ? Number(selected.price) : 0;

    setServiceRows(updated);
  };

  /* ---------- ADD/REMOVE SERVICE ROW ---------- */
  const addServiceRow = () =>
    setServiceRows((p) => [
      ...p,
      {
        category: "",
        subcategory: "",
        serviceId: "",
        serviceName: "",
        packageId: "",
        price: 0,
        subcategories: [],
        servicesList: [],
        packages: [],
        inspectionRequired: false,
      },
    ]);

  const removeServiceRow = (index: number) =>
    setServiceRows((p) => p.filter((_, i) => i !== index));

  /* ---------- GET SELECTED LABELS ---------- */
  const getSelectedLabels = () =>
    serviceRows
      .map((row) => {
        if (row.packageId)
          return row.packages.find(
            (p) => `${p.service_id}-${p.fullLabel}` === row.packageId
          )?.fullLabel;

        if (row.serviceName)
          return row.inspectionRequired
            ? `${row.serviceName} (Inspection)`
            : row.serviceName;

        return null;
      })
      .filter(Boolean) as string[];

  const removeSelectedByLabel = (label: string) => {
    const findIdx = serviceRows.findIndex((r) => {
      const pkgMatch = r.packages.some(
        (p) => p.fullLabel === label && `${p.service_id}-${p.fullLabel}` === r.packageId
      );
      const inspectionMatch =
        label.includes("Inspection") &&
        r.serviceName &&
        label.includes(r.serviceName);

      return pkgMatch || inspectionMatch;
    });

    if (findIdx >= 0) removeServiceRow(findIdx);
  };

  /* ---------- CALCULATE TOTAL ---------- */
  useEffect(() => {
    const amount = serviceRows.reduce((sum, r) => sum + (r.price || 0), 0);
    const names = getSelectedLabels().join(", ");

    setForm((p) => ({
      ...p,
      bookingAmount: amount,
      bookingServiceName: names,
    }));

    const gstCalc = amount * 0.18;
    setGST(gstCalc);
    setGrandTotal(amount + gstCalc);
  }, [serviceRows]);

  /* ---------- SUBMIT ---------- */
  const handleCreate = async () => {
    if (!form.customerName || !form.customerNumber || !form.bookingServiceName) {
      alert("Please fill Name, Phone Number and Select Service");
      return;
    }

    setSaving(true);

    const payload = {
      ...form,
      bookingTime: form.bookingTime ? convert24To12(form.bookingTime) : null,
      grandTotal,
    };

    try {
      const res = await axios.post(
        `${Global_API_BASE}/api/bookings/admin/create`,
        payload
      );

      try {
        await BookingsAPIService.sendBookingNotification(
          res.data?.customer_email || form.customerEmail,
          res.data?.customer_number || form.customerNumber,
          "received"
        );
      } catch {}

      alert("Booking Created!");
      onCreated();
      onClose();
    } catch (e) {
      alert("Failed to create booking");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* -------------------------------- UI ---------------------------------- */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 z-50">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-xl flex flex-col max-h-[90vh]">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-2xl font-bold text-navy-700">Create New Booking</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* BODY */}
        <div className="grid grid-cols-2 gap-8 px-8 py-6 overflow-y-auto">

          {/* LEFT SIDE */}
          <div className="space-y-6 pr-4">

            {/* CUSTOMER DETAILS */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Customer Details
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <input className="input" placeholder="Full name" name="customerName" value={form.customerName} onChange={handleChange} />
                <input className="input" placeholder="Email address" name="customerEmail" value={form.customerEmail} onChange={handleChange} />
                <input className="input" placeholder="Phone number" name="customerNumber" value={form.customerNumber} onChange={handleChange} />
                <input className="input" placeholder="Address" name="addressLine1" value={form.addressLine1} onChange={handleChange} />
                <input className="input" placeholder="City" name="city" value={form.city} onChange={handleChange} />
                <input className="input" placeholder="Pincode" name="pincode" value={form.pincode} onChange={handleChange} />
              </div>
            </div>

            {/* SELECTED SERVICES LIST */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Selected Services
              </h3>

              {getSelectedLabels().length === 0 ? (
                <div className="text-sm text-gray-500">No services selected yet.</div>
              ) : (
                getSelectedLabels().map((label, idx) => (
                  <div key={idx} className="bg-white border rounded-md p-3 shadow-sm flex justify-between items-center">
                    <span>{label}</span>
                    <button onClick={() => removeSelectedByLabel(label)} className="text-red-600 text-sm">
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* TOTALS */}
            <div className="bg-white border rounded-md p-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-lg font-semibold">₹{form.bookingAmount}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">GST (18%)</p>
                  <p className="text-lg font-semibold">₹{gst.toFixed(2)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Grand Total</p>
                  <p className="text-lg font-bold text-green-700">
                    ₹{grandTotal.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* REMARKS */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Remarks
              </h3>
              <textarea className="input min-h-[80px]" name="remarks" value={form.remarks} onChange={handleChange} />
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-5 pl-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Select Services
            </h3>

            {serviceRows.map((row, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4 border mb-4">

                {/* CATEGORY - SUBCATEGORY - SERVICE */}
                <div className="grid grid-cols-3 gap-3">
                  <select className="input" value={row.category} onChange={(e) => handleCategoryChange(index, e.target.value)}>
                    <option value="">Category</option>
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>

                  <select
                    className="input"
                    value={row.subcategory}
                    disabled={!row.category}
                    onChange={(e) => handleSubCategoryChange(index, e.target.value)}
                  >
                    <option value="">Sub Category</option>
                    {row.subcategories.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>

                  <select
                    className="input"
                    value={row.serviceId}
                    disabled={!row.category}
                    onChange={(e) => handleServiceSelect(index, e.target.value)}
                  >
                    <option value="">Select Service</option>

                    {(row.servicesList.length > 0
                      ? row.servicesList
                      : allServices.filter((s) => s.service_category === row.category)
                    ).map((s) => (
                      <option key={s.service_id} value={s.service_id}>
                        {s.service_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PACKAGES */}
                <div className="mt-2">
                  {row.packages.length > 0 ? (
                    <select
                      className="input"
                      value={row.packageId}
                      onChange={(e) => handlePackageChange(index, e.target.value)}
                    >
                      <option value="">Select Package</option>
                      {row.packages.map((pkg, i) => (
                        <option key={i} value={`${pkg.service_id}-${pkg.fullLabel}`}>
                          {pkg.fullLabel} – ₹{pkg.price}
                        </option>
                      ))}
                    </select>
                  ) : row.serviceName ? (
                    <span className="text-yellow-700 bg-yellow-50 border rounded px-3 py-1 text-sm inline-block mt-1">
                      Inspection required — no packages
                    </span>
                  ) : null}
                </div>

                {/* PRICE DISPLAY */}
                <div className="flex justify-between items-center mt-3">
                  <p className="text-sm text-gray-600">
                    Price: <strong>₹{row.price}</strong>
                  </p>

                  {serviceRows.length > 1 && (
                    <button
                      className="text-sm text-red-600"
                      onClick={() => removeServiceRow(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}

            <Button
              onClick={addServiceRow}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              + Add Service
            </Button>

            {/* DATE & TIME */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <input
                type="date"
                name="bookingDate"
                value={form.bookingDate}
                onChange={handleChange}
                className="input"
              />
              <select
                name="bookingTime"
                value={form.bookingTime}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select Time Slot</option>
                {Array.from({ length: 13 }).map((_, i) => {
                  const hour = 8 + i;
                  const label = new Date(0, 0, 0, hour).toLocaleTimeString(
                    "en-IN",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  );
                  return <option key={hour}>{label}</option>;
                })}
              </select>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-green-600 text-white px-6 py-2 rounded-lg"
            onClick={handleCreate}
            disabled={saving}
          >
            {saving ? "Saving..." : "Create Booking"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateBookingModal;
