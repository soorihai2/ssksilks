declare module 'express' {
  const express: any;
  export = express;
}

declare module 'cors' {
  const cors: any;
  export = cors;
}

// Fix other module declarations
declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.png' {
  const content: any;
  export default content;
}

declare module '*.jpg' {
  const content: any;
  export default content;
} 