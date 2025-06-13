import React, { useState, useEffect } from "react";

// Impor gambar dari folder assets/images/avatars/
import bocchiAvatar from "../assets/images/avatars/bocchi.jpg";
import nijikaAvatar from "../assets/images/avatars/nijika.jpg";
import ryoAvatar from "../assets/images/avatars/ryo.jpg";
import ikuyoAvatar from "../assets/images/avatars/ikuyo.jpg";
import bocchiBg from "../assets/images/avatars/bocchi-sigma.jpg";
import nijikaBg from "../assets/images/avatars/Nijikadigital.jpg";
import ryoBg from "../assets/images/avatars/about_you.jpg";
import ikuyoBg from "../assets/images/avatars/ikuyo_meme.jpg";

// Komponen untuk memilih avatar dengan efek highlight
const AvatarSelect = ({ onSelect, selectedAvatar }) => {
  const avatars = [
    {
      src: bocchiAvatar,
      alt: "Bocchi",
      bgClass: "bg-gradient-to-r from-yellow-300 to-pink-400",
      bgImage: bocchiBg,
    },
    {
      src: nijikaAvatar,
      alt: "Nijika",
      bgClass: "bg-gradient-to-r from-purple-300 to-blue-200",
      bgImage: nijikaBg,
    },
    {
      src: ryoAvatar,
      alt: "Ryo",
      bgClass: "bg-gradient-to-r from-green-300 to-gray-400",
      bgImage: ryoBg,
    },
    {
      src: ikuyoAvatar,
      alt: "Ikuyo",
      bgClass: "bg-gradient-to-r from-orange-300 to-red-200",
      bgImage: ikuyoBg,
    },
  ];

  const handleSelect = (avatarSrc, bgClass, bgImage) => {
    onSelect({ src: avatarSrc, bgClass, bgImage });
  };

  return (
    <div className="flex justify-center space-x-4 mb-4 relative">
      {avatars.map((avatar, index) => (
        <div
          key={index}
          className={`cursor-pointer transition-all duration-300 ${
            selectedAvatar?.src === avatar.src
              ? "scale-110 border-4 border-pink-600 rounded-full"
              : ""
          }`}
          onClick={() =>
            handleSelect(avatar.src, avatar.bgClass, avatar.bgImage)
          }
        >
          <img
            src={avatar.src}
            alt={avatar.alt}
            className="w-16 h-16 rounded-full border-2 border-pink-200 hover:border-purple-300"
          />
          <p className="text-center text-sm text-gray-700 mt-1">{avatar.alt}</p>
        </div>
      ))}
    </div>
  );
};

const InitialScreen = ({ onStart }) => {
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [isFading, setIsFading] = useState(false);

  const handleStart = () => {
    if (name && selectedAvatar) {
      onStart({
        name,
        avatar: selectedAvatar.src,
        bgClass: selectedAvatar.bgClass,
        bgImage: selectedAvatar.bgImage,
      });
    }
  };

  useEffect(() => {
    if (selectedAvatar) {
      setIsFading(true);
      const fadeTimeout = setTimeout(() => setIsFading(false), 500);
      return () => clearTimeout(fadeTimeout);
    }
  }, [selectedAvatar]);

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Latar belakang dengan efek fade */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          backgroundImage: selectedAvatar?.bgImage
            ? `url(${selectedAvatar.bgImage})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: isFading ? 0 : 1,
        }}
      >
        {/* Overlay gradien */}
        <div
          className="absolute inset-0"
          style={{
            background:
              selectedAvatar?.bgClass ||
              "linear-gradient(to bottom, #fff3b0, #ffc1cc)",
            opacity: 0.3,
          }}
        ></div>
      </div>
      {/* Konten utama */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white bg-opacity-80 p-6 rounded-lg shadow-lg flex flex-col items-center">
          <h1
            className="text-4xl font-bold mb-6 text-gray-800"
            style={{ fontFamily: "'Comic Sans MS', cursive" }}
          >
            Ucup Menjelajah Nusantara v2.0{" "}
            <span role="img" aria-label="music">
              🎸
            </span>
          </h1>
          <AvatarSelect
            onSelect={setSelectedAvatar}
            selectedAvatar={selectedAvatar}
          />
          <input
            type="text"
            color="black"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masukkan nama (misalnya, Bocchi)"
            className="p-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-purple-300 mb-4 mt-4"
          />
          <button
            onClick={handleStart}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-pink-400 transition duration-200 disabled:opacity-50"
            disabled={!name || !selectedAvatar}
          >
            Mulai Menjelajah!
          </button>
        </div>
      </div>
    </div>
  );
};

export default InitialScreen;
