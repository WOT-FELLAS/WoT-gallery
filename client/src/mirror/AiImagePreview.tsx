import { useState } from "react";
import { io } from "socket.io-client";

interface AiImagePreviewProps {
  artStyle: string;
  handleImageData: (img: string | null) => void;
  relativeImg: string;
  openModule: boolean;
  artTitle: string;
  runToastSuccess: () => void;
}

export default function AiImagePreview({
  handleImageData,
  artStyle,
  relativeImg,
  artTitle,
  runToastSuccess,
}: AiImagePreviewProps) {
  const [isFocusedIndex0, setIsFocusedIndex0] = useState(false);
  const [isFocusedIndex1, setIsFocusedIndex1] = useState(false);
  const socket = io("http://localhost:3000/gallery");

  const handleSubmitArt = async () => {
    // The data object to be sent in the POST request
    const newArtData = {
      generation_date: new Date(),
      url: relativeImg,
      art_style: artStyle,
      art_title: artTitle.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, ""),
    };

    try {
      const response = await fetch("http://localhost:5353/mirror", {
        method: "POST", // Make a POST request
        headers: {
          "Content-Type": "application/json", // Set the content type to JSON
        },
        body: JSON.stringify(newArtData), // Convert the data to JSON and send it
      });

      const data = await response.json();

      if (response.status === 201) {
        handleImageData(null);
        runToastSuccess();

        // Notify the WebSocket about the new image
        socket.emit("new-image"); // Emit new image data to the WebSocket server
      } else {
        console.log("Error creating AI art");
        console.error(data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div
      className='flex flex-col relative pt-[15dvh] left-[2dvw] items-center'
      aria-describedby={undefined}
    >
      <h1 className='text-5xl pb-[10dvh] albert-sans-regular'>
        YOUR ART IS GENERATED
      </h1>
      {artTitle && (
        <div className='flex flex-col items-center justify-center gap-8 '>
          <p className='text-xl '>Title of the artwork</p>
          <h2 className='text-5xl text-center aboreto-regular'>
            “{artTitle.toLocaleUpperCase()}”
          </h2>
          <div>
            <p className='text-xl text-center'>in the style of</p>
            <h3 className='text-[28px] text-center aboreto-regular'>
              {artStyle}
            </h3>
          </div>
        </div>
      )}
      <div className='pt-[10dvh]'>
        <div className='w-[30dvw] bg-[#D4BD91] flex flex-col items-center p-4 border border-[#44361C] rounded-[12px]'>
          <div className='mb-[3dvh]'>
            <p className='aboreto-regular text-[24px] mb-[2dvh]'>
              TODAYS GALLERY
            </p>
            <p className='text-[19px]'>
              We want to share your ai generated art to the smArt Gallery. The
              gallery is open to the public for 12 hours.
            </p>
          </div>
          <div className='flex gap-12'>
            <button
              tabIndex={1}
              type='button'
              onFocus={() => setIsFocusedIndex1(true)}
              onBlur={() => setIsFocusedIndex1(false)}
              className={`selectedTabIndex albert-sans-regular flex items-center w-[10dvw] justify-around text-[20px] text-[#7A0B0B] rounded
                ${
                  isFocusedIndex1
                    ? "bg-[#7A0B0B] text-[#F0E8D9] border border-[#6c1b1b] animate-pulse-tab"
                    : "border border-[#D4BD91] underline"
                }
                `}
              onClick={() => {
                handleImageData(null);
                setIsFocusedIndex1(false);
              }}
            >
              {isFocusedIndex1 ? (
                <img
                  src='assets/icons/arrow-left-white.png'
                  alt=''
                  className=''
                />
              ) : (
                <img
                  src='assets/icons/arrow-left-red.png'
                  alt=''
                  className=''
                />
              )}

              <span>BACK TO START</span>
            </button>
            <button
              type='submit'
              onFocus={() => setIsFocusedIndex0(true)}
              onBlur={() => setIsFocusedIndex0(false)}
              className={`selectedTabIndex albert-sans-regular rounded w-[12dvw] flex items-center justify-between  text-[20px] px-[12px] py-[8px] 
                ${
                  isFocusedIndex0
                    ? "bg-[#3B6246] border border-[#0F281C] text-[#F0E8D9] animate-pulse-tab"
                    : "text-[#3B6246] underline border border-[#D4BD91]"
                }`}
              onClick={() => handleSubmitArt()}
            >
              <span>SEND TO GALLERY</span>
              {isFocusedIndex0 ? (
                <img src='assets/icons/shareArrow.png' alt='' className='' />
              ) : (
                <img
                  src='assets/icons/shareArrowGreen.png'
                  alt=''
                  className=''
                />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className='flex flex-col justify-center items-center pt-[5dvh]'>
        <h2 className='text-xl'>Want to see other paintings?</h2>
        <p>more generated artworks are displayed on </p>
        <p>the smArt gallery</p>
      </div>
    </div>
  );
}
