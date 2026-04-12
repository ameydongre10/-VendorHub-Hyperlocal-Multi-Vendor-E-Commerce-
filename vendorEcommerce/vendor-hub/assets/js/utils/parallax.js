export const initParallax = () => {
    document.addEventListener("mousemove", (e) => {
        const cards = document.querySelectorAll(".stat-card, .product-card, .auth-container");
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const cardX = rect.left + rect.width / 2;
            const cardY = rect.top + rect.height / 2;

            // Calculate rotation based on distance from mouse
            const rotateX = (mouseY - cardY) / 25; 
            const rotateY = (cardX - mouseX) / 25;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });
    });

    // Reset position when mouse leaves
    document.addEventListener("mouseleave", () => {
        const cards = document.querySelectorAll(".stat-card, .product-card, .auth-container");
        cards.forEach(card => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        });
    });
};