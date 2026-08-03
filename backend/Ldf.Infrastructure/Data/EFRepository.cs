using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Ldf.Core.Interfaces;

namespace Ldf.Infrastructure.Data;

public class EFRepository<T> : IRepository<T> where T : class
{
    protected readonly LdfDbContext _context;

    public EFRepository(LdfDbContext context)
    {
        _context = context;
    }

    public IQueryable<T> Query() => _context.Set<T>();

    public async Task<T?> GetByIdAsync(string id, CancellationToken cancellationToken = default) 
        => await _context.Set<T>().FindAsync(new object[] { id }, cancellationToken);

    public async Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default) 
        => await _context.Set<T>().ToListAsync(cancellationToken);

    public async Task AddAsync(T entity, CancellationToken cancellationToken = default) 
        => await _context.Set<T>().AddAsync(entity, cancellationToken);

    public void Update(T entity) => _context.Set<T>().Update(entity);

    public void Delete(T entity) => _context.Set<T>().Remove(entity);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) 
        => await _context.SaveChangesAsync(cancellationToken);
}
