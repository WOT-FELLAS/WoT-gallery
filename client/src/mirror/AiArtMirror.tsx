import { useEffect, useRef, useState } from "react";
import "./AiArtMirror.css";
import AiImagePreview from "./AiImagePreview";
import SelectStyle from "./SelectStyle";
import { Style } from "./styles";
import io from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const socket = io("http://10.22.218.178:3000/controller");

export default function AiArtMirror() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const focusedElementRef = useRef<HTMLElement | null>(null);

  const [countdown, setCountdown] = useState<number | null>(null);
  const [blitz, setBlitz] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showCapturePhotoButtons, setShowCapturePhotoButtons] = useState(false);
  const [recievedImg, setRecievedImg] = useState<string | null>(null);
  const [relativeImg, setRelativeImg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [voiceOptions, setVoiceOptions] = useState(false);
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [imageTitle, setImageTitle] = useState<string | null>(null);

  useEffect(() => {
    socket.on("style-changed", (style) => {
      setSelectedStyle(style);
    });

    socket.on("handle-go-back", () => {
      handleGoBack();
    });

    socket.on("handle-capture-photo", () => {
      startCountdown();
    });

    return () => {
      socket.off("style-changed");
      socket.off("toggle-camera");
      socket.off("handle-go-back");
      socket.off("handle-click");
      socket.off("toggle-recognizing");
    };
  }, []);

  useEffect(() => {
    const focusFirstElement = () => {
      setTimeout(() => {
        const focusableElements = Array.from(
          document.querySelectorAll("[tabindex]")
        );

        const elementsToFocus = selectedStyle
          ? Array.from(document.querySelectorAll(".selectedTabIndex"))
          : focusableElements;

        if (elementsToFocus.length > 0) {
          const firstElement = elementsToFocus[0] as HTMLElement;
          firstElement.focus();
          focusedElementRef.current = firstElement;
        }
      }, 0); // Delay for the DOM to update
    };
    focusFirstElement();
  }, [selectedStyle, showCapturePhotoButtons, recievedImg]);

  useEffect(() => {
    const handleSwipe = (direction: string) => {
      const focusableElements = Array.from(
        document.querySelectorAll("[tabindex]")
      );
      const selectedTabIndexElements = Array.from(
        document.querySelectorAll(".selectedTabIndex")
      );
      const elementsToSwipe = selectedStyle
        ? selectedTabIndexElements
        : focusableElements;

      if (!focusedElementRef.current) {
        const firstElement = elementsToSwipe[0] as HTMLElement;
        if (firstElement) {
          firstElement.focus();
          focusedElementRef.current = firstElement;
        }
        return;
      }

      const currentIndex = elementsToSwipe.indexOf(focusedElementRef.current);
      console.log(`Current index: ${currentIndex}`);

      if (direction === "left") {
        const previousIndex =
          (currentIndex - 1 + elementsToSwipe.length) % elementsToSwipe.length;
        const previousElement = elementsToSwipe[previousIndex] as HTMLElement;
        if (previousElement && previousElement !== focusedElementRef.current) {
          previousElement.focus();
          focusedElementRef.current = previousElement; // Update ref
        }
      } else if (direction === "right") {
        const nextIndex = (currentIndex + 1) % elementsToSwipe.length;
        const nextElement = elementsToSwipe[nextIndex] as HTMLElement;
        if (nextElement && nextElement !== focusedElementRef.current) {
          nextElement.focus();
          focusedElementRef.current = nextElement; // Update ref
        }
      } else if (direction === "down") {
        const nextIndex = (currentIndex + 2) % elementsToSwipe.length;
        const nextElement = elementsToSwipe[nextIndex] as HTMLElement;
        if (nextElement && nextElement !== focusedElementRef.current) {
          nextElement.focus();
          focusedElementRef.current = nextElement; // Update ref
        }
      } else if (direction === "up") {
        const nextIndex = (currentIndex - 2) % elementsToSwipe.length;
        const nextElement = elementsToSwipe[nextIndex] as HTMLElement;
        if (nextElement && nextElement !== focusedElementRef.current) {
          nextElement.focus();
          focusedElementRef.current = nextElement; // Update ref
        }
      }
    };

    socket.on("handle-click", () => {
      console.log("Received button click from phone!");
      if (focusedElementRef.current) {
        const clickSound = new Audio("/assets/click.wav");
        focusedElementRef.current.click();
        clickSound.play();
      }
    });

    socket.on("handle-direction", (direction) => {
      console.log(`Received direction ${direction} from phone!`);
      handleSwipe(direction);
      const menuSound = new Audio("/assets/menu.wav");
      menuSound.play();
    });

    const handleFocus = (event: FocusEvent) => {
      if (event.target instanceof HTMLElement) {
        focusedElementRef.current = event.target;
      }
    };

    const handleBlur = () => {
      focusedElementRef.current = null;
    };

    document.addEventListener("focusin", handleFocus);
    document.addEventListener("focusout", handleBlur);

    return () => {
      socket.off("handle-click");
      socket.off("handle-direction");
      document.removeEventListener("focusin", handleFocus);
      document.removeEventListener("focusout", handleBlur);
    };
  }, [selectedStyle]);

  useEffect(() => {
    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: {} })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error("Error accessing webcam: ", err));
    };

    startVideo();
  }, [showPreview]);

  useEffect(() => {
    const SpeechRecognition = (window.SpeechRecognition ||
      window.webkitSpeechRecognition) as typeof window.SpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.lang = "en-US";
      recognition.interimResults = false;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[event.resultIndex][0].transcript
          .trim()
          .toLowerCase();
        setTranscription(transcript);
      };

      // Cleanup
      return () => {
        recognition.stop();
      };
    } else {
      console.error("Speech Recognition not supported in this browser.");
    }
  }, []);

  const handleVideoOnPlay = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
  };

  const takeScreenshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      if (context) {
        context.save();

        context.scale(-1, 1);
        context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);

        context.restore();

        const img = canvas.toDataURL("image/png");
        setImageData(img);
        setShowPreview(true);
        const shutterSound = new Audio("/assets/shutter.mp3");
        shutterSound.play();
      }
    }
  };

  const startCountdown = () => {
    setCountdown(5);
    setShowCapturePhotoButtons(false);
    const interval = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown && prevCountdown > 1) {
          return prevCountdown - 1;
        } else {
          clearInterval(interval);
          setCountdown(null);
          triggerBlitzEffect();
          takeScreenshot();
          return null;
        }
      });
    }, 1000);
  };
  useEffect(() => {
    if (imageData) {
      handleConfirmScreenshot();
    }
  }, [imageData]);

  const triggerBlitzEffect = () => {
    setBlitz(true);
    setTimeout(() => setBlitz(false), 500);
  };

  const handleConfirmScreenshot = async () => {
    setIsProcessing(true);
    runToastProcessing();

    if (imageData) {
      try {
        const response = await fetch("http://localhost:5353/upload-base64", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageData,
            selectedStyle: selectedStyle?.style_prompt,
          }),
        });

        if (response.ok) {
          const responseData = await response.json();
          console.log("Image uploaded successfully");
          console.log("Response data:", responseData);

          // Extract the AI image URL from the response
          const { aiPreview, aiImg, aiImageTitle } = responseData;
          setRecievedImg(aiPreview); // Set the received AI image
          setRelativeImg(aiImg);
          setImageTitle(aiImageTitle);
          console.log("AI image URL:", aiPreview);
          setIsProcessing(false);
        } else {
          console.error("Error uploading image");
          const errorData = await response.json();
          console.error("Error details:", errorData);
          setIsProcessing(false);
        }
      } catch (error) {
        console.error("Error uploading image", error);
        setIsProcessing(false);
      }
    } else {
      console.error("No image data to send");
      setIsProcessing(false);
    }

    setImageData(null);
  };

  const handleRecievedImg = (img: string | null) => {
    setRecievedImg(img);
    setImageData(null);
    setShowPreview(false);
    setSelectedStyle(null);
  };

  const handleStyleSelect = (style: Style) => {
    setSelectedStyle(style);
    setStyleDropdownOpen(false);
  };

  const handleGoBack = () => {
    setSelectedStyle(null);
  };

  const elevatorAudio = useRef(new Audio("/assets/elevator.mp3"));
  useEffect(() => {
    if (isProcessing) {
      const playAudio = async () => {
        try {
          await elevatorAudio.current.play();
        } catch (error) {
          console.error("Failed to play audio:", error);
        }
      };

      playAudio();
    } else {
      if (elevatorAudio.current) {
        elevatorAudio.current.pause();
        elevatorAudio.current.currentTime = 0;
      }
    }
  }, [isProcessing]);

  const runToastSuccess = () =>
    toast.success("AI image sent to Gallery!", {
      position: "bottom-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  const runToastProcessing = () =>
    toast.info("Photo captured! This will not be saved.", {
      position: "bottom-center",
      autoClose: 10000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  return (
    <>
      <ToastContainer
        className={"ml-[400px]"}
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
      />
      <div
        className='grid h-screen bg-[#F0E8D9]'
        style={{ gridTemplateColumns: "40% 60%" }}
      >
        <div className='logo absolute w-[130px]  mt-[26px] ml-[36px]'>
          <img src='assets/icons/logo.svg' alt='' />
        </div>
        {!recievedImg ? (
          <SelectStyle
            onCapturePhoto={startCountdown}
            onCloseModal={() => setShowCapturePhotoButtons(false)}
            onStyleSelect={handleStyleSelect}
            voiceOptions={voiceOptions}
            onResetVoiceOptions={() => setVoiceOptions(false)}
            selectedStyleDrop={selectedStyle}
            styleDropdownOpen={styleDropdownOpen}
            onGoBack={handleGoBack}
            isProcessing={isProcessing}
          />
        ) : (
          <AiImagePreview
            openModule
            artStyle={selectedStyle ? selectedStyle.name : ""}
            artTitle={imageTitle || ""}
            handleImageData={handleRecievedImg}
            relativeImg={relativeImg || ""}
            runToastSuccess={runToastSuccess}
          />
        )}

        <div className={`relative h-full ${blitz ? "blitz-effect" : ""}`}>
          <div className='absolute z-10 w-full mt-20'></div>
          {imageData ? (
            <>
              <img
                className='object-cover w-full h-full pt-[40px] pr-[40px] pb-[40px] overlay-opacity'
                src={imageData || undefined}
              />
              <div className='absolute top-0 w-full h-[90%] flex justify-center items-center  mt-[40px] mr-[40px] mb-[40px]'>
                <div className='spinner'></div>
              </div>
            </>
          ) : !recievedImg && !showPreview ? (
            <>
              <video
                ref={videoRef}
                className='object-cover w-full h-full inverted-video pt-[40px] pl-[40px] pb-[40px]'
                autoPlay
                muted
                onPlay={handleVideoOnPlay}
              />
            </>
          ) : (
            <img
              src={recievedImg || ""}
              alt='AI generated image'
              className='object-cover h-full p-[40px]'
            />
          )}

          <canvas ref={canvasRef} className='hidden' />
          {countdown !== null && (
            <div className='absolute p-4 text-white transform -translate-x-1/2 -translate-y-1/2 text-9xl top-1/2 left-1/2'>
              <span className='countdown'>{countdown}</span>
            </div>
          )}

          {transcription && (
            <div className='absolute bottom-0 right-0 w-full mb-4 transcription-wrapper'>
              <div className='h-auto text-white bg-black bg-opacity-50 transcription-container'>
                "{transcription}"
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
