/**
 * generateSpherePoints
 *
 * Returns typed arrays for N points distributed inside a sphere.
 * Uses a hybrid distribution: most points uniformly fill the volume,
 * while a portion are concentrated on the outer shell to create
 * a defined spherical boundary.
 */
export interface SpherePointData {
  positions: Float32Array;
  directions: Float32Array;
  seeds: Float32Array;
  sizes: Float32Array;
}

export function generateSpherePoints(
  count: number,
  radius: number = 1.0,
  densityExponent: number = 0.45
): SpherePointData {
  const positions = new Float32Array(count * 3);
  const directions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const sizes = new Float32Array(count);

  // 30% of points go on/near the shell for a defined edge
  const shellFraction = 0.30;
  const shellCount = Math.floor(count * shellFraction);

  for (let i = 0; i < count; i++) {
    // Uniform direction on the unit sphere
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    const dx = Math.sin(phi) * Math.cos(theta);
    const dy = Math.sin(phi) * Math.sin(theta);
    const dz = Math.cos(phi);

    let r: number;
    if (i < shellCount) {
      // Shell points: distributed in the outer 15% of the radius
      r = radius * (0.85 + 0.15 * Math.random());
    } else {
      // Volume points: center-dense distribution filling the interior
      r = radius * Math.pow(Math.random(), densityExponent);
    }

    const i3 = i * 3;
    positions[i3] = dx * r;
    positions[i3 + 1] = dy * r;
    positions[i3 + 2] = dz * r;

    directions[i3] = dx;
    directions[i3 + 1] = dy;
    directions[i3 + 2] = dz;

    seeds[i] = Math.random();

    // Slightly smaller dots at extremes, uniform-ish otherwise
    const normalizedR = r / radius;
    sizes[i] = 0.8 + 0.2 * (1.0 - normalizedR);
  }

  return { positions, directions, seeds, sizes };
}
