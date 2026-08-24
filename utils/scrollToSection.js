export const scrollToSection = (id, e) => {
    e?.preventDefault();
    document.getElementById(id)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
    });
}
