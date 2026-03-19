export default function PublicHeader() {
  return (
    <header style={{padding:20, display:'flex', justifyContent:'space-between'}}>
      <div>Specterfy</div>
      <div>
        <a href="/pricing">Pricing</a>
        <a href="/login" style={{marginLeft:20}}>Log in</a>
      </div>
    </header>
  );
}