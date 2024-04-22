import React, { useState, useRef, useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import InfoDialog from "./InfoDialog";
import Dialog from "@mui/material/Dialog";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Select from "react-select";
import colorStyle from "../utils/styleReactSelect";
import Loading from "./Loading";

const CreateRecipe = ({ onClose }) => {
  const axiosPrivate = useAxiosPrivate();
  const [errMsg, setErrMsg] = useState("");
  const [infoDialog, setInfoDialog] = useState(false);
  const [uploadedData, setUploadedData] = useState();
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(false);

  const [stripeID, setStripeID] = useState();
  const [price, setPrice] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);

  const fileInputRef = useRef(null);

  const { register, control, handleSubmit } = useForm({
    defaultValues: {
      extendedIngredients: [{ original: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "extendedIngredients",
  });

  const uploadingDietsDishTypesCuisines = async () => {
    const data = await axiosPrivate.get("/recipes/data");
    setLoading(false);
    setUploadedData(data);
  };
  const closeDialog = () => {
    setInfoDialog(false);
    // onClose();
  };
  const onSubmit = async (data) => {
    const formData = new FormData();

    formData.append("title", data.title);
    formData.append("cuisines", JSON.stringify(data.cuisines));
    formData.append("dishTypes", JSON.stringify(data.dishtype));
    formData.append("diets", JSON.stringify(data.diet));
    formData.append("instructions", data.instructions);
    formData.append(
      "extendedIngredients",
      JSON.stringify(data.extendedIngredients)
    );
    formData.append("readyInMinutes", data.totalmin);

    if (stripeID !== undefined && price !== 0) {
      formData.append("stripeAccountId", stripeID);
      formData.append("price", price);
    }

    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      const response = await axiosPrivate.post("/recipes", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setInfoDialog(true);
      setInfo("Your recipe has been successfully created");
    } catch (error) {
      setInfoDialog(true);
      setInfo("You need to be logged in first");
    }
  };

  useEffect(() => {
    uploadingDietsDishTypesCuisines();
  }, []);
  return (
    <>
      <div className="w-full h-full relative create-recipe-dialog ">
        <div className="bg-gradient-to-l contain from-transparent  to-black to-65% w-[1190px] h-[710px] top-[36px] fixed top-0 z-8 flex flex-col items-start justify-start pt-40 2xl:pt-20 px-4 left-[258px] rounded-[45px]"></div>
        <div className="bg-gradient-to-l  contain from-transparent to-black to-65% w-[1190px] h-[710px] top-[36px] fixed top-0 z-8 flex flex-col items-start justify-start pt-40 2xl:pt-20 px-4 rounded-[45px]"></div>
        <div className="h-screen w-full relative py-10 pb-5 bg  -transparent">
          <div
            className="text-white right-[280px] fixed top-[50px] cursor-pointer"
            onClick={() => onClose()}
          >
            <FontAwesomeIcon icon={faX} color={"gray"} fontSize={25 + "px"} />
          </div>
          {loading ? (
            <Loading />
          ) : (
            <div className="h-full w-[400px] z-20 text-center flex flex-col items-center rounded-[45px]">
              <span className="text-white font-Nunito text-xl font-bold">
                Granny's<span className="text-[#166534] text-2xl">Recipes</span>
              </span>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="text-[#1FB137] text-left w-[340px] mt-10 py-5"
              >
                <label className="text-[#1FB137] text-base font-bold ">
                  Name of recipe:
                  <br />
                  <input
                    {...register("title")}
                    placeholder="Enter title of recipe"
                    className=" border-[#1FB137] bg-black border w-full py-2 pl-4 pr-10"
                  />
                </label>
                <label className="text-[#1FB137] text-base font-bold inline-block mt-5 w-full">
                  Cuisine type:
                  <Controller
                    name="cuisines"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={uploadedData?.data?.cuisines}
                        isMulti
                        isClearable
                        styles={colorStyle}
                      />
                    )}
                  />
                </label>
                <label className="text-[#1FB137] text-base font-bold inline-block mt-5 w-full">
                  Dish type:
                  <Controller
                    name="dishtype"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={uploadedData?.data?.dishTypes}
                        isMulti
                        isClearable
                        styles={colorStyle}
                      />
                    )}
                  />
                </label>
                <label className="text-[#1FB137] text-base font-bold inline-block mt-5 w-full">
                  Diet:
                  <Controller
                    name="diet"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={uploadedData?.data?.diets}
                        isMulti
                        isClearable
                        styles={colorStyle}
                      />
                    )}
                  />
                </label>
                <label className="text-[#1FB137] text-base font-bold inline-block mt-5 w-full">
                  Total time(in min):
                  <br />
                  <input
                    type="number"
                    placeholder="Enter total time"
                    onWheel={(e) => e.target.blur()}
                    {...register("totalmin")}
                    className=" border-[#1FB137] bg-black border w-full py-2 pl-4 pr-10"
                  />
                </label>
                <span className="text-[#1FB137] text-base font-bold inline-block mt-5 w-full radio-container">
                  Ingredients
                </span>
                <ul>
                  {fields.map((field, index) => {
                    return (
                      <li key={field.id}>
                        <input
                          {...register(`extendedIngredients.${index}.original`)}
                          className=" border-[#1FB137] bg-black border w-4/6 py-2 pl-4 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="bg-[#166534] rounded-3xl text-white text-2xl text-center cursor-pointer inline-block ml-3 px-2 py-1"
                        >
                          Delete
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <button
                  type="button"
                  onClick={() => {
                    append({ original: "" });
                  }}
                  className="bg-[#166534] rounded-3xl text-white text-xl text-center cursor-pointer inline-block mt-2 px-4 py-1"
                >
                  Append
                </button>
                <span className="text-[#1FB137] text-base font-bold inline-block mt-5 w-full radio-container">
                  Instructions
                </span>
                <textarea
                  placeholder="Enter instructions"
                  {...register("instructions")}
                  className="border-[#1FB137] h-[200px] text-[#1FB137] bg-black border w-full py-2 pl-4 pr-10 resize-none"
                />
                <label className="text-[#1FB137] text-base font-bold inline-block w-full radio-container mt-5">
                  <input
                    type="radio"
                    name="payment"
                    checked
                    className="radio-input"
                    onChange={() => setPayment(false)}
                  />
                  <span className="label-text">Free</span>
                </label>
                <label className="text-[#1FB137] text-base font-bold inline-block mt-2 w-full radio-container">
                  <input
                    type="radio"
                    name="payment"
                    className="radio-input"
                    onChange={() => setPayment(true)}
                  />
                  <span className="label-text">Paid</span>
                </label>
                {/* {payment && (
                  <>
                    <label className="text-[#1FB137] text-base font-bold inline-block w-full mt-5">
                      Stripe ID:
                      <br />
                      <input
                        type="text"
                        name="stripe-id"
                        placeholder="Your stripe accound ID"
                        required
                        maxLength={50}
                        className=" border-[#1FB137] bg-black border w-full py-2 pl-4 pr-10"
                        onChange={(e) => setStripeID(e.target.value)}
                      />
                    </label>
                    <label className="text-[#1FB137] text-base font-bold inline-block w-full mt-5">
                      Price:
                      <br />
                      <input
                        type="number"
                        name="price"
                        placeholder="Price for the recipe"
                        required
                        className="border-[#1FB137] bg-black border w-full py-2 pl-4 pr-10"
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </label>
                  </>
                )} */}
                <label className="text-[#1FB137] text-base font-bold inline-block mt-5 w-full radio-container">
                  Pick an image
                </label>
                <input
                  type="file"
                  name="image"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="hidden"
                  ref={fileInputRef}
                  id="fileInput"
                  accept="image/*"
                />
                <label
                  htmlFor="fileInput"
                  className={`bg-[#166534] w-[130px] h-[45px] rounded-3xl text-white text-xl text-center cursor-pointer inline-block mt-2 px-4 py-2 ${
                    selectedFile ? "bg-gray-700" : ""
                  }`}
                >
                  {"Choose"}
                </label>
                <br />
                <br />
                {selectedFile ? (
                  <>
                    <span className="text-[#1FB137] text-base">
                      Chosen file:
                      <span className="text-base w-100">
                        {" "}
                        {selectedFile.name}
                      </span>
                    </span>
                    <div className="mt-3 relative">
                      <div>
                        <div
                          className="absolute inline-block m-2 left-40 cursor-pointer"
                          onClick={() => {
                            setSelectedFile(null);
                            fileInputRef.current.value = null;
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faX}
                            color={"black"}
                            fontSize={25 + "px"}
                          />
                        </div>
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          className="rounded-lg md:w-[200px] h-[200px] md:h-[150px]"
                          alt=""
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <span className="text-[#1FB137] text-base">
                    Image is not chosen
                  </span>
                )}
                <div className="text-left text-orange-900 mt-5">{errMsg}</div>
                <div className="flex justify-center mt-12">
                  <button
                    type="submit"
                    value="Sign in"
                    className="bg-[#166534] w-[130px] h-[45px]  rounded-3xl text-white text-xl self-center"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          )}
          <Dialog
            open={infoDialog}
            onClose={closeDialog}
            fullWidth
            maxWidth="xs"
            PaperProps={{ style: { height: "100px", borderradius: "50%" } }}
          >
            <InfoDialog info={info} onClose={closeDialog} />
          </Dialog>
        </div>
      </div>
    </>
  );
};

export default CreateRecipe;
