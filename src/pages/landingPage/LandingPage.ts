import { ref, onMounted, onBeforeUnmount } from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faDiscord, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Add icons to library
library.add(faDiscord, faYoutube);

export function initLandingPage() {
    const hero = ref(null);
    const features = ref(null);
    const video = ref(null);
    const testimonials = ref(null);
    const socials = ref(null);
    const observers = ref<IntersectionObserver[]>([]);

    const formData = ref({
        name: '',
        email: '',
        message: ''
    });

    onMounted(() => {
        // Create intersection observers for each section
        const sections = ['features', 'video', 'testimonials', 'socials'];

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        sections.forEach(sectionId => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in');
                        // Optionally unobserve after animation
                        // observer.unobserve(entry.target);
                    } else {
                        // Remove the class when section is not in view
                        entry.target.classList.remove('fade-in');
                    }
                });
            }, observerOptions);

            const section = eval(`${sectionId}.value`);
            if (section) {
                observer.observe(section);
                observers.value.push(observer);
            }
        });
    });

    onBeforeUnmount(() => {
        // Clean up observers
        observers.value.forEach(observer => observer.disconnect());
    });

    return {
        hero,
        features,
        video,
        testimonials,
        socials,
        formData,
        observers
    }
}