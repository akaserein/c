// admin.js
// Exports helper: checkLogin(username,password)

// Stored admin credentials (username -> sha256 of password)
// Passwords provided by you:
// 1) Username: bilalking, Password: 12345bilal
// 2) Username: AS, Password: xyz#12345

const CREDENTIALS = {
  "bilalking": "4b5ea4978d06c8df911450f6e2fe48edcda55ddb631dbf6dc9f37f8f7561b0dc",
  "AS": "74d4e0ca768b219e1c490876892dc2eef116f3510703775593a1f0417588a4be"
};

export async function hashString(s){
  const enc = new TextEncoder();
  const data = enc.encode(s);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const arr = Array.from(new Uint8Array(hash));
  return arr.map(b=>b.toString(16).padStart(2,'0')).join('');
}

export async function checkLogin(username, password){
  if(!username) return false;
  const uname = username.trim();
  const h = await hashString(password);
  return (CREDENTIALS[uname] && CREDENTIALS[uname] === h);
}
