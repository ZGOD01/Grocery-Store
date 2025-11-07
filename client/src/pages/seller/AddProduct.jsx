import React, { useState, useRef, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { assets, categories } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const AddProduct = () => {
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [barcode, setBarcode] = useState("");

  const [isScanning, setIsScanning] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { axios } = useAppContext();
  const videoRef = useRef(null);
  const codeReader = useRef(new BrowserMultiFormatReader());
  const [stream, setStream] = useState(null);

  // ✅ Start Barcode Scanning Effect
  useEffect(() => {
    if (isScanning && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((mediaStream) => {
          setStream(mediaStream);
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();

          codeReader.current.decodeFromVideoDevice(
            null,
            videoRef.current,
            (result, err) => {
              if (result) {
                const code = result.getText();
                setBarcode(code);
                toast.success(`Detected Barcode: ${code}`);
                handleBarcodeLookup(code);

                setIsScanning(false);
                stopCamera();
              }
            }
          );
        })
        .catch((err) => {
          toast.error("Camera access denied or unavailable");
          setIsScanning(false);
        });
    }

    return () => {
      stopCamera();
    };
    // eslint-disable-next-line
  }, [isScanning]);

  // ✅ Stop Camera Helper
  const stopCamera = () => {
    codeReader.current.reset();
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  // ✅ Fetch Product Info using Barcode
  const handleBarcodeLookup = async (code) => {
    try {
      toast.loading("Fetching product info...");
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${code}.json`
      );
      const data = await res.json();
      toast.dismiss();

      if (data.status === 1) {
        const product = data.product;
        setName(product.product_name || "");
        setDescription(product.generic_name || "");
        setCategory(product.categories_tags?.[0]?.replace("en:", "") || "");
        setPrice("");
        setOfferPrice("");
        setQuantity(1);
        setShowConfirm(true);
      } else {
        toast.error("No product info found for this barcode");
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Error fetching product details");
    }
  };

  // ✅ Handle Add Product Submit
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        name,
        description: description.split("\n"),
        category,
        price,
        offerPrice,
        quantity,
        barcode,
      };

      const formData = new FormData();
      formData.append("productData", JSON.stringify(productData));
      files.forEach((file) => formData.append("images", file));

      const { data } = await axios.post("/api/product/add", formData);
      if (data.success) {
        toast.success(data.message);
        setName("");
        setDescription("");
        setCategory("");
        setPrice("");
        setOfferPrice("");
        setQuantity("");
        setFiles([]);
        setBarcode("");
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
      <div className="flex flex-col md:flex-row md:space-x-10 p-6">
        {/* ---------- LEFT SIDE: Manual Form ---------- */}
        <form
          onSubmit={onSubmitHandler}
          className="space-y-5 w-full md:w-1/2"
        >
          {/* Product Image */}
          <div>
            <p className="text-base font-medium">Product Image</p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {Array(4)
                .fill("")
                .map((_, index) => (
                  <label key={index} htmlFor={`image${index}`}>
                    <input
                      type="file"
                      id={`image${index}`}
                      hidden
                      onChange={(e) => {
                        const updatedFiles = [...files];
                        updatedFiles[index] = e.target.files[0];
                        setFiles(updatedFiles);
                      }}
                    />
                    <img
                      className="max-w-24 cursor-pointer"
                      src={
                        files[index]
                          ? URL.createObjectURL(files[index])
                          : assets.upload_area
                      }
                      alt="uploadArea"
                      width={100}
                      height={100}
                    />
                  </label>
                ))}
            </div>
          </div>

          {/* Product Name */}
          <div className="flex flex-col gap-1 max-w-md">
            <label className="text-base font-medium" htmlFor="product-name">
              Product Name
            </label>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              id="product-name"
              type="text"
              placeholder="Type here"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              required
            />
          </div>

          {/* Product Description */}
          <div className="flex flex-col gap-1 max-w-md">
            <label
              className="text-base font-medium"
              htmlFor="product-description"
            >
              Product Description
            </label>
            <textarea
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              id="product-description"
              rows={4}
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
              placeholder="Type here"
            ></textarea>
          </div>

          {/* Category */}
          <div className="w-full flex flex-col gap-1">
            <label className="text-base font-medium" htmlFor="category">
              Category
            </label>
            <select
              onChange={(e) => setCategory(e.target.value)}
              value={category}
              id="category"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            >
              <option value="">Select Category</option>
              {categories.map((item, index) => (
                <option key={index} value={item.path}>
                  {item.path}
                </option>
              ))}
            </select>
          </div>

          {/* Price and Offer Price */}
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex-1 flex flex-col gap-1 w-32">
              <label className="text-base font-medium" htmlFor="product-price">
                Product Price
              </label>
              <input
                onChange={(e) => setPrice(e.target.value)}
                value={price}
                id="product-price"
                type="number"
                placeholder="0"
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                required
              />
            </div>
            <div className="flex-1 flex flex-col gap-1 w-32">
              <label className="text-base font-medium" htmlFor="offer-price">
                Offer Price
              </label>
              <input
                onChange={(e) => setOfferPrice(e.target.value)}
                value={offerPrice}
                id="offer-price"
                type="number"
                placeholder="0"
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                required
              />
            </div>
          </div>

          {/* Quantity */}
          <div className="flex flex-col gap-1 max-w-md">
            <label className="text-base font-medium" htmlFor="quantity">
              Stock Quantity
            </label>
            <input
              onChange={(e) => setQuantity(e.target.value)}
              value={quantity}
              id="quantity"
              type="number"
              placeholder="Enter quantity"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              required
            />
          </div>

          <button className="px-8 py-2.5 bg-primary text-white font-medium rounded cursor-pointer">
            ADD
          </button>
        </form>

        {/* ---------- RIGHT SIDE: Barcode Scanner ---------- */}
        <div className="md:w-1/2 w-full mt-10 md:mt-0 flex flex-col items-center justify-start border border-gray-300 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Scan Product Barcode</h2>

          {!isScanning && (
            <button
              onClick={() => setIsScanning(true)}
              className="px-5 py-2 bg-green-600 text-white rounded mb-3"
              type="button"
            >
              Start Scanning
            </button>
          )}

          {barcode && (
            <p className="text-sm text-gray-700 mb-2">
              Detected Barcode: <b>{barcode}</b>
            </p>
          )}

          {isScanning && (
            <div className="relative w-full max-w-xs">
              {/* Camera Feed */}
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-auto rounded-lg object-cover"
              />

              {/* Dark Overlay with Center Box */}
              <div className="absolute inset-0 bg-black/60 rounded-lg">
                <div className="absolute top-1/2 left-1/2 w-48 h-48 border-4 border-green-500 rounded-md transform -translate-x-1/2 -translate-y-1/2 bg-transparent shadow-[0_0_20px_2px_rgba(0,255,0,0.3)] animate-pulse"></div>
              </div>

              {/* Stop Button */}
              <button
                onClick={() => {
                  stopCamera();
                  setIsScanning(false);
                }}
                className="absolute bottom-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-red-600 text-white rounded-md shadow-md"
                type="button"
              >
                Stop
              </button>
            </div>
          )}


          {showConfirm && (
            <div className="mt-4 bg-gray-100 border rounded-lg p-3 text-center">
              <p className="text-sm mb-2">
                Product info fetched! Do you want to edit before saving?
              </p>
              <div className="flex justify-center gap-3">
                <button
                  className="px-4 py-1.5 bg-blue-600 text-white rounded"
                  onClick={() => setShowConfirm(false)}
                >
                  Yes, Edit
                </button>
                <button
                  className="px-4 py-1.5 bg-green-600 text-white rounded"
                  onClick={() => {
                    setShowConfirm(false);
                    document.querySelector("form").requestSubmit();
                  }}
                >
                  No, Save Directly
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
