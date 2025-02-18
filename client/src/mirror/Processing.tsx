import { useState, useEffect } from "react";
import "./Processing.css";

export default function Processing() {
  const messages = [
    "The oldest known art dates back over 40,000 years, with cave paintings found in Sulawesi, Indonesia.",
    "Leonardo da Vinci carried the Mona Lisa with him for years, tweaking it until his death, suggesting he was never fully satisfied with it.",
    "Vincent van Gogh used so much yellow in his work that it became a defining feature of his style, possibly due to a medical condition affecting his vision.",
    "The modern art movement was initially dismissed by traditional critics as nonsense or accidental, sparking debates on what constitutes art.",
    "Edvard Munch's The Scream was nearly destroyed in a fire but was saved just in time by alert firefighters.",
    "Famous art forger Han van Meegeren fooled experts with his fake Vermeer paintings, earning millions and eventually becoming more famous than some original works.",
    "Banksy rigged his artwork, Girl with Balloon, to self-destruct by shredding after it was sold at auction, which only increased its value.",
    "The color blue was once rare and expensive because it was made from lapis lazuli, a gemstone, which limited its use in older European artworks.",
    "The Statue of Liberty was originally a shiny copper color, but over time, oxidation turned it green, giving it the look we recognize today.",
    "Many wealthy individuals donate valuable artwork to museums and then use it as a tax deduction, making art both an expression and a financial strategy.",
    "Claude Monet, one of the founders of Impressionism, painted his garden at Giverny over 250 times, often changing only the light or time of day.",
    "In ancient Egypt, artists painted people from multiple perspectives—side profiles with frontal torsos—to capture a complete 'ideal' view.",
    "Andy Warhol once sold a painting of a Campbell’s Soup can for $100, a piece that today is considered priceless.",
    "The first documented female artist, Enheduanna, lived around 2300 BCE in ancient Mesopotamia, creating hymns and poetry.",
    "Pablo Picasso's full name has 23 words, including the names of various saints and relatives—a testament to Spanish naming traditions.",
    "Ancient Greek statues were originally painted in vibrant colors, but over time, the pigments faded, leaving behind only the white marble.",
    "The most stolen artwork in history is Ghent Altarpiece by Jan van Eyck, stolen 13 times and even hidden by Nazis during WWII.",
    "Frida Kahlo, famous for her self-portraits, often included her pet animals—monkeys, parrots, and dogs—as symbols of protection and companionship.",
    "Salvador Dalí frequently walked around Paris with a pet anteater, showcasing his eccentric personality beyond his surrealist artwork.",
    "In ancient Japan, broken pottery was repaired with gold or silver lacquer in a process called 'kintsugi,' turning cracks into unique features.",
  ];

  const [currentMessage, setCurrentMessage] = useState(messages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 10000);

    return () => clearInterval(interval);
  }, [messages]);

  return <span>{currentMessage}</span>;
}
