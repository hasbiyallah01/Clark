using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClarkC.Core.Domain.Entities
{
    public class Auditables
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }
        public bool IsDeleted { get; set; } = false;
        public string? CreatedBy { get; set; }
        public string? ModifiedBy { get; set; }
        public string? DeletedBy { get; set; }
        [Column(TypeName = "timestamp with time zone")]
        private DateTime? _dateModified {  get; set; }
        
        public DateTime? DateModified
        {
            get => _dateModified;
            set => _dateModified = value.HasValue ? DateTime.SpecifyKind(value.Value, DateTimeKind.Utc) : (DateTime?)null;
        }
        [Column(TypeName = "timestamp with time zone")]

        private DateTime? _dateCreated;
        public DateTime? DateCreated
        {
            get => _dateCreated;
            set => _dateCreated = value.HasValue ? DateTime.SpecifyKind(value.Value, DateTimeKind.Utc) : (DateTime?)null;
        }
    }
}