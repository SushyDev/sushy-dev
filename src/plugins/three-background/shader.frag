uniform vec2 iResolution;
uniform vec2 iMouse;
uniform float iTime;
uniform sampler2D iTex;
uniform float speed;
uniform vec3 skyColor;
uniform vec3 cloudColor;
uniform vec3 lightColor;

# define T texture2D(iTex, fract((s*p.zw + ceil(s*p.x)) / 200.0)).y / (s += s) * 4.0

void main(){
    vec2 coord = gl_FragCoord.xy;
    vec4 p, d = vec4(1.0, 0, coord / iResolution.y - 0.5);
    vec3 out1 = skyColor - d.w; // sky gradient
    float s, f, t = 200.0 + sin(dot(coord,coord));
    const float MAX_ITER = 100.0;
    for (float i = 1.0; i <= MAX_ITER; i += 1.0) {
      t -= 2.0; if (t < 0.0) { break; } // march step
      p = 0.05 * t * d;
      p.xz += iTime * 0.50000 * speed; // movement through space
      p.x += sin(iTime * 0.25 * speed) * 0.25;
      s = 2.25;
      f = p.w + 1.0-T-T-T-T;
      if (f < 0.0) {
        vec3 cloudColorShading = mix(lightColor, cloudColor, -f);
        out1 = mix(out1, cloudColorShading, -f * 0.3);
      }
    }
    gl_FragColor = vec4(out1, 1);
}
