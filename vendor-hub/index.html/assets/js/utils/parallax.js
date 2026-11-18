export const initParallax = () => {
    // Only enable parallax on desktop / fine pointer devices to prevent mobile lag
    if (window.matchMedia && !window.matchMedia('(pointer: fine)').matches) return;

    let ticking = false;

    document.addEventListener("mousemove", (e) => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const cards = document.querySelectorAll(".stat-card, .product-card, .auth-container");
                const mouseX = e.clientX;
                const mouseY = e.clientY;

                cards.forEach(card => {
                    const rect = card.getBoundingClientRect();
                    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

                    const cardX = rect.left + rect.width / 2;
                    const cardY = rect.top + rect.height / 2;

                    // Clamped subtle 3D tilt
                    const rotateX = Math.max(-10, Math.min(10, (mouseY - cardY) / 35)); 
                    const rotateY = Math.max(-10, Math.min(10, (cardX - mouseX) / 35));

                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
                });
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    document.addEventListener("mouseleave", () => {
        const cards = document.querySelectorAll(".stat-card, .product-card, .auth-container");
        cards.forEach(card => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        });
    });
};
