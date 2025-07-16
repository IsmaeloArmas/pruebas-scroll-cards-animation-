document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger, SplitText);

    // Configuración de Lenis para scroll suavizado
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    const cards = gsap.utils.toArray(".card");
    const firstCard = cards[0]; // Nombre consistente para la primera tarjeta

    // Animación de títulos con SplitText
    const titles = gsap.utils.toArray(".card-title h1");
    titles.forEach((title) => {
        const split = new SplitText(title, {
            type: "char",
            charsClass: "char",
            tag: "div",
        });
        split.chars.forEach((char) => {
            char.innerHTML = `<span>${char.textContent}</span>`;
        });
    });

    // Configuración inicial de la imagen de la primera tarjeta
    const cardImgWrapper = firstCard.querySelector(".card-img");
    const cardImg = firstCard.querySelector(".card-img img");
    gsap.set(cardImgWrapper, {scale: 0.5, borderRadius: "400px"});
    gsap.set(cardImg, {scale: 1.5});

    // Funciones de animación
    function animateContentIn(titleChars, description) {
        gsap.to(titleChars, {x: "0%", duration: 0.75, ease: "power4.out"});
        gsap.to(description, {
            x: 0,
            opacity: 1,
            duration: 0.75,
            delay: 0.1,
            ease: "power4.out",
        });
    }

    function animateContentOut(titleChars, description) {
        gsap.to(titleChars, {x: "100%", duration: 0.5, ease: "power4.out"});
        gsap.to(description, {
            x: "40px",
            opacity: 0,
            duration: 0.5,
            ease: "power4.out",
        });
    }

    // Elementos de la primera tarjeta
    const marquee = firstCard.querySelector(".card-marquee .marquee");
    const titleChars = firstCard.querySelectorAll(".char span");
    const description = firstCard.querySelector(".card-description");

    // ScrollTrigger para la primera tarjeta
    ScrollTrigger.create({
        trigger: firstCard,
        start: "top top",
        end: "+=300vh",
        onUpdate: (self) => {
            const progress = self.progress;
            const imgScale = 0.5 + progress * 0.5;
            const borderRadius = 400 - progress * 375;
            const innerImgScale = 1.5 - progress * 0.5;

            gsap.set(cardImgWrapper, {
                scale: imgScale,
                borderRadius: borderRadius + "px",
            });
            gsap.set(cardImg, { scale: innerImgScale });

            if (marquee) { // Solo si existe el marquee
                if (imgScale > 0.5 && imgScale < 0.75){
                    const fadeProgress = (imgScale -0.5) / (0.75 - 0.5);
                    gsap.set(marquee, { opacity: 1 - fadeProgress});
                } else if (imgScale < 0.5){
                    gsap.set(marquee, {opacity: 1});
                } else if (imgScale > 0.75) {
                    gsap.set(marquee, {opacity: 0});
                }
            }

            if (progress > 0.5 && !firstCard.contentRevealed){
                firstCard.contentRevealed = true;
                animateContentIn(titleChars, description);
            }
            if (progress < 0.5 && firstCard.contentRevealed){
                firstCard.contentRevealed = false;
                animateContentOut(titleChars, description);
            }
        },
    });

    // ScrollTrigger para todas las tarjetas (pinning)
    cards.forEach((card, index) => {
        const isLastCard = index === cards.length - 1;
        ScrollTrigger.create({
            trigger: card,
            start: "top top",
            end: isLastCard ? "+=100vh" : "bottom top",
            pin: true,
            pinSpacing: isLastCard,
        });
    });

    // Animación de transición entre tarjetas
    cards.forEach((card, index) => {
        if (index < cards.length - 1) {
            const nextCard = cards[index + 1];
            const cardImgWrapper = card.querySelector(".card-img");
            
            ScrollTrigger.create({
                trigger: nextCard,
                start: "top bottom",
                end: "top top",
                onUpdate: (self) => {
                    const progress = self.progress;
                    gsap.set(cardImgWrapper, {
                        scale: 1 - progress * 0.25,
                        opacity: 1 - progress,
                    });
                },
            });
        }
    });

    // Animación de contenido para tarjetas (excepto la primera)
    cards.forEach((card, index) => {
        if (index === 0) return;
        
        const cardImg = card.querySelector(".card-img img");
        const imgContainer = card.querySelector(".card-img");
        const cardDescription = card.querySelector(".card-description");
        const cardTitleChars = card.querySelectorAll(".char span");
        
        // Animación de imagen al aparecer
        ScrollTrigger.create({
            trigger: card,
            start: "top bottom",
            end: "top top",
            onUpdate: (self) => {
                const progress = self.progress;
                gsap.set(cardImg, { scale: 2 - progress});
                gsap.set(imgContainer, { borderRadius: 150 - progress * 125 + "px"});
            },
        });
        
        // Animación de texto
        ScrollTrigger.create({
            trigger: card,
            start: "top top",
            onEnter: () => animateContentIn(cardTitleChars, cardDescription),
            onLeaveBack: () => animateContentOut(cardTitleChars, cardDescription),
        });
    });
});

console.log(document.querySelectorAll('.card')); // Debe mostrar 4 elementos  