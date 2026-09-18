/**
 * isAtLeast14YearsOld
 *
 * @param {string} birthDateString - 'YYYY-MM-DD' 형식의 생년월일 [Required]
 * @returns {boolean} 만 14세 이상 여부
 *
 * Example usage:
 * isAtLeast14YearsOld('2010-01-01');
 */
export function isAtLeast14YearsOld(birthDateString) {
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }
  return age >= 14;
}
