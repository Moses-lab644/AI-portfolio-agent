class PortfolioAgent {
    constructor(userData) {
        this.userData = userData;
        this.skills = [];
        this.projects = [];
        this.experience = [];
        this.personality = {};
    }

    // Initialize agent with user data
    initialize(profileData) {
        this.skills = profileData.skills || [];
        this.projects = profileData.projects || [];
        this.experience = profileData.experience || [];
        this.personality = profileData.personality || {};
    }

    // Generate AI responses based on user queries
    generateResponse(query) {
        const lowerQuery = query.toLowerCase();
        
        if (lowerQuery.includes('skill') || lowerQuery.includes('technology')) {
            return this.getSkillsResponse();
        }
        
        if (lowerQuery.includes('project') || lowerQuery.includes('work')) {
            return this.getProjectsResponse();
        }
        
        if (lowerQuery.includes('experience') || lowerQuery.includes('background')) {
            return this.getExperienceResponse();
        }
        
        return this.getDefaultResponse();
    }

    getSkillsResponse() {
        if (this.skills.length === 0) {
            return "I'm still learning about my skills and technologies. Please update my profile!";
        }
        return `I'm proficient in: ${this.skills.join(', ')}. I love working with these technologies!`;
    }

    getProjectsResponse() {
        if (this.projects.length === 0) {
            return "I haven't added any projects yet. Check back soon for updates!";
        }
        return `I've worked on ${this.projects.length} projects including: ${this.projects.slice(0, 3).map(p => p.name).join(', ')}.`;
    }

    getExperienceResponse() {
        if (this.experience.length === 0) {
            return "I'm building my experience portfolio. Stay tuned for updates!";
        }
        return `I have experience in ${this.experience.map(e => e.role).join(', ')}.`;
    }

    getDefaultResponse() {
        return "Hi! I'm your AI portfolio agent. Ask me about skills, projects, or experience!";
    }

    // Update agent knowledge
    updateProfile(newData) {
        if (newData.skills) this.skills = [...this.skills, ...newData.skills];
        if (newData.projects) this.projects = [...this.projects, ...newData.projects];
        if (newData.experience) this.experience = [...this.experience, ...newData.experience];
    }
}

module.exports = PortfolioAgent;