import cvUrl from '../assets/documents/DUPONT_Lelian_CV_ATS.pdf?url'
import avatarUrl from '../assets/images/profile/avatar.png'

// Profile details and biography provided by the portfolio owner.
export const profile = {
  name: 'L.D',
  role: 'Cybersecurity student',
  location: 'Paris, FR',
  avatar: {
    url: avatarUrl,
    alt: 'Pixel-art portrait in a dark hoodie',
  },
  cv: {
    url: cvUrl,
    filename: 'DUPONT_Lélian_CV_ATS.pdf',
  },
  description:
    'Currently pursuing a Master’s degree in Cybersecurity through a work-study program. I enjoy taking on new challenges, improving my skills, and continuously learning in the fields that interest me.',
  tags: ['Systems & Network Admin', 'Azure', 'SOC', 'Cloud infrastructure', 'Active Directory'],
  heroLines: ['Cybersecurity', 'student'],
  introduction: 'Strong interest in Cloud Computing, Pentesting and Database Administration.',
}
